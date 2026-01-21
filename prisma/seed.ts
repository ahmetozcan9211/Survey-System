import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Seeding database...')

    // Clean up existing data
    await prisma.answer.deleteMany()
    await prisma.response.deleteMany()
    await prisma.option.deleteMany()
    await prisma.question.deleteMany()
    await prisma.survey.deleteMany()

    // 1. Satisfaction Survey
    const satisfactionSurvey = await prisma.survey.create({
        data: {
            titleTR: 'Müşteri Memnuniyet Anketi',
            titleEN: 'Customer Satisfaction Survey',
            type: 'SATISFACTION',
            questions: {
                create: [
                    {
                        type: 'RATE',
                        textTR: 'Genel olarak hizmetimizden ne kadar memnunsunuz?',
                        textEN: 'Overall, how satisfied are you with our service?',
                        descriptionTR: '1 (Hiç Memnun Değilim) - 5 (Çok Memnunum)',
                        descriptionEN: '1 (Very Dissatisfied) - 5 (Very Satisfied)',
                        required: true,
                        order: 1
                    },
                    {
                        type: 'CHOICE',
                        textTR: 'Bizi başkalarına tavsiye eder misiniz?',
                        textEN: 'Would you recommend us to others?',
                        required: true,
                        order: 2,
                        options: {
                            create: [
                                { textTR: 'Evet', textEN: 'Yes' },
                                { textTR: 'Hayır', textEN: 'No' },
                                { textTR: 'Belki', textEN: 'Maybe' }
                            ]
                        }
                    },
                    {
                        type: 'TEXT',
                        textTR: 'Hizmetimizi geliştirmek için önerileriniz nelerdir?',
                        textEN: 'What suggestions do you have to improve our service?',
                        required: false, // Optional
                        order: 3
                    }
                ]
            }
        }
    })
    console.log(`Created satisfaction survey`)

    // 2. Post-Sales Surveillance Survey
    const surveillanceSurvey = await prisma.survey.create({
        data: {
            titleTR: 'Satış Sonrası Gözetim Anketi',
            titleEN: 'Post-Sales Surveillance Survey',
            type: 'SURVEILLANCE',
            questions: {
                create: [
                    {
                        type: 'RATE',
                        textTR: 'Ürün kalitesinden memnun kaldınız mı?',
                        textEN: 'Were you satisfied with the product quality?',
                        descriptionTR: '1-5 Puan veriniz',
                        descriptionEN: 'Rate 1-5',
                        required: true,
                        order: 1
                    },
                    {
                        type: 'CHOICE',
                        textTR: 'Teslimat süreci nasıldı?',
                        textEN: 'How was the delivery process?',
                        required: true,
                        order: 2,
                        options: {
                            create: [
                                { textTR: 'Hızlı', textEN: 'Fast' },
                                { textTR: 'Normal', textEN: 'Normal' },
                                { textTR: 'Yavaş', textEN: 'Slow' }
                            ]
                        }
                    },
                    {
                        type: 'TEXT',
                        textTR: 'Eklemek istedikleriniz:',
                        textEN: 'Additional comments:',
                        required: false,
                        order: 3
                    }
                ]
            }
        }
    })
    console.log(`Created surveillance survey`)
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
