import mongoose from 'mongoose'

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/sibercone'

const products = [
  {
    name: 'Невидимая колода',
    slug: 'nevidimaya-koloda',
    description:
      'Классический трюк с невидимой колодой. Зритель называет любую карту — и она оказывается перевёрнутой в колоде! Идеальный эффект для начинающих и профессионалов. В комплекте колода и подробная видео-инструкция.',
    price: 1200,
    category: 'micro',
    images: [],
    videoUrl: '',
    inStock: true,
  },
  {
    name: 'Монеты сквозь стол',
    slug: 'monety-skvoz-stol',
    description:
      'Набор специальных монет для выполнения классического трюка «Монеты сквозь стол». Четыре монеты одна за другой проходят сквозь твёрдую поверхность стола. Высшее качество изготовления.',
    price: 3500,
    category: 'micro',
    images: [],
    videoUrl: '',
    inStock: true,
  },
  {
    name: 'Появление голубя',
    slug: 'poyavlenie-golubya',
    description:
      'Профессиональный реквизит для появления голубя из пустого платка. Компактная конструкция, подходит для сценических выступлений. Лёгкая настройка и надёжный механизм.',
    price: 8500,
    category: 'scene',
    images: [],
    videoUrl: '',
    inStock: true,
  },
  {
    name: 'Левитация стола',
    slug: 'levitaciya-stola',
    description:
      'Световой стол для иллюзии левитации. Стол поднимается в воздух прямо на глазах у зрителей! Сборная конструкция, удобная для транспортировки. Максимальная нагрузка — 5 кг.',
    price: 25000,
    category: 'scene',
    images: [],
    videoUrl: '',
    inStock: false,
  },
  {
    name: 'Книга ментальных тестов',
    slug: 'kniga-mentalnyh-testov',
    description:
      'Специальная книга для ментальных фокусов. Зритель выбирает любое слово на любой странице — и вы его угадываете! Более 200 страниц, лёгкий в освоении принцип работы.',
    price: 4200,
    category: 'mentalism',
    images: [],
    videoUrl: '',
    inStock: true,
  },
  {
    name: 'Конверт предсказаний',
    slug: 'konvert-predskazanij',
    description:
      'Набор для выполнения эффекта предсказания. Вы заранее запечатываете конверт с предсказанием — и оно совпадает с выбором зрителя! Многоразовый реквизит высокого качества.',
    price: 2800,
    category: 'mentalism',
    images: [],
    videoUrl: '',
    inStock: true,
  },
]

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('Connected to MongoDB')

    const Product = mongoose.model(
      'Product',
      new mongoose.Schema({
        name: String,
        slug: { type: String, unique: true },
        description: String,
        price: Number,
        category: String,
        images: [String],
        videoUrl: String,
        inStock: Boolean,
        createdAt: { type: Date, default: Date.now },
      }),
    )

    await Product.deleteMany({})
    console.log('Cleared existing products')

    await Product.insertMany(products)
    console.log(`Inserted ${products.length} products`)

    await mongoose.disconnect()
    console.log('Done!')
  } catch (err) {
    console.error('Seed error:', err)
    process.exit(1)
  }
}

seed()
