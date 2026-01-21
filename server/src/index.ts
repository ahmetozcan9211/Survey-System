import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma from './lib/prisma.js';
import { z } from 'zod';
import { RateLimiterMemory } from 'rate-limiter-flexible';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Rate Limiter for sensitive endpoints
const rateLimiter = new RateLimiterMemory({
    points: 10,
    duration: 60,
});

// --- AUTH ROUTES ---
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    const validUsername = process.env.ADMIN_USERNAME || 'admin';
    const validPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (username === validUsername && password === validPassword) {
        res.json({ success: true, message: 'Logged in' });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

// --- SURVEY ROUTES ---

app.get('/api/survey', async (req, res) => {
    try {
        const surveys = await prisma.survey.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                questions: true,
                _count: {
                    select: { responses: true }
                }
            }
        });
        res.json(surveys);
    } catch (error) {
        console.error('GET /api/survey Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/survey/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const survey = await prisma.survey.findUnique({
            where: { id },
            include: {
                questions: {
                    include: { options: true },
                    orderBy: { order: 'asc' }
                }
            }
        });
        if (!survey) return res.status(404).json({ error: 'Survey not found' });
        res.json(survey);
    } catch (error) {
        console.error('GET /api/survey/:id Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/survey/:id/responses', async (req, res) => {
    try {
        const { id } = req.params;
        const responses = await prisma.response.findMany({
            where: { surveyId: id },
            include: {
                answers: {
                    include: { question: true }
                },
                survey: {
                    select: { revision: true, titleTR: true, titleEN: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(responses);
    } catch (error) {
        console.error('GET /api/survey/:id/responses Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/api/survey/create', async (req, res) => {
    try {
        const { titleTR, titleEN, type, questions, revision } = req.body;
        const survey = await prisma.survey.create({
            data: {
                titleTR,
                titleEN,
                type,
                revision: revision || "1.0",
                questions: {
                    create: questions.map((q: any, idx: number) => ({
                        textTR: q.textTR,
                        textEN: q.textEN,
                        descriptionTR: q.descriptionTR,
                        descriptionEN: q.descriptionEN,
                        type: q.type,
                        required: q.required,
                        order: idx,
                        options: {
                            create: (q.options || []).map((opt: any) => ({
                                textTR: opt.textTR,
                                textEN: opt.textEN
                            }))
                        }
                    }))
                }
            }
        });
        res.json(survey);
    } catch (error) {
        console.error('POST /api/survey/create Error:', error);
        res.status(500).json({ error: 'Failed to create survey' });
    }
});

app.put('/api/survey/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { titleTR, titleEN, type, questions, revision } = req.body;

        // Smart update: Handle questions and options without deleting the entire relationship
        await prisma.$transaction(async (tx: any) => {
            // 1. Update basic survey info
            await tx.survey.update({
                where: { id },
                data: { titleTR, titleEN, type, revision }
            });

            // 2. Manage questions
            const incomingQuestionIds = questions.filter((q: any) => q.id).map((q: any) => q.id);

            // Delete questions that are no longer present
            await tx.question.deleteMany({
                where: {
                    surveyId: id,
                    id: { notIn: incomingQuestionIds }
                }
            });

            for (const q of questions) {
                if (q.id) {
                    // Update existing question
                    await tx.question.update({
                        where: { id: q.id },
                        data: {
                            textTR: q.textTR,
                            textEN: q.textEN,
                            descriptionTR: q.descriptionTR,
                            descriptionEN: q.descriptionEN,
                            type: q.type,
                            required: q.required,
                            order: q.order
                        }
                    });

                    // Sync options for existing question
                    const incomingOptionIds = q.options.filter((o: any) => o.id).map((o: any) => o.id);
                    await tx.option.deleteMany({
                        where: {
                            questionId: q.id,
                            id: { notIn: incomingOptionIds }
                        }
                    });

                    for (const opt of q.options) {
                        if (opt.id) {
                            await tx.option.update({
                                where: { id: opt.id },
                                data: { textTR: opt.textTR, textEN: opt.textEN }
                            });
                        } else {
                            await tx.option.create({
                                data: {
                                    questionId: q.id,
                                    textTR: opt.textTR,
                                    textEN: opt.textEN
                                }
                            });
                        }
                    }
                } else {
                    // Create new question
                    await tx.question.create({
                        data: {
                            surveyId: id,
                            textTR: q.textTR,
                            textEN: q.textEN,
                            descriptionTR: q.descriptionTR,
                            descriptionEN: q.descriptionEN,
                            type: q.type,
                            required: q.required,
                            order: q.order,
                            options: {
                                create: (q.options || []).map((o: any) => ({
                                    textTR: o.textTR,
                                    textEN: o.textEN
                                }))
                            }
                        }
                    });
                }
            }
        });

        res.json({ success: true });
    } catch (error) {
        console.error('PUT /api/survey/:id Error:', error);
        res.status(500).json({ error: 'Failed to update survey' });
    }
});

app.delete('/api/survey/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.survey.delete({ where: { id } });
        res.json({ success: true });
    } catch (error) {
        console.error('DELETE /api/survey/:id Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/api/survey/respond', async (req, res) => {
    const ip = req.ip || 'unknown';
    try {
        await rateLimiter.consume(ip);
    } catch {
        return res.status(429).json({ error: 'Too many requests' });
    }
    try {
        const { surveyId, customerInfo, language, answers } = req.body;
        const response = await prisma.response.create({
            data: {
                surveyId,
                customerInfo: JSON.stringify(customerInfo),
                language,
                answers: {
                    create: Object.entries(answers).map(([questionId, value]) => ({
                        questionId,
                        value: String(value)
                    }))
                }
            }
        });
        res.json({ success: true, id: response.id });
    } catch (error) {
        console.error('POST /api/survey/respond Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.delete('/api/survey/response/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.response.delete({ where: { id } });
        res.json({ success: true });
    } catch (error) {
        console.error('DELETE /api/survey/response/:id Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/api/translate', async (req, res) => {
    try {
        const { text, targetLang } = req.body;
        if (!text) return res.status(400).json({ error: 'Text required' });

        const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=tr|${targetLang}`);
        const data: any = await response.json();
        res.json({ translatedText: data.responseData.translatedText });
    } catch (error) {
        console.error('Translate Error:', error);
        res.status(500).json({ error: 'Translation failed' });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
