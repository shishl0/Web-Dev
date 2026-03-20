import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'shop_back.settings')
django.setup()

from api.models import Category, Product

# Clear existing data
Category.objects.all().delete()
Product.objects.all().delete()

# Create Categories
categories_data = [
    {'name': 'RAM'},
    {'name': 'Видеокарты'},
    {'name': 'Процессоры'},
]

categories = {}
for cat_data in categories_data:
    cat = Category.objects.create(name=cat_data['name'])
    categories[cat_data['name']] = cat

# RAM Products
Product.objects.create(
    name='Оперативная память Kingston FURY Beast 32GB DDR5 5200MHz',
    price=85000,
    description='Kingston: конфигурация 32 ГБ · DDR5 · 5200 МГц для мощной и сбалансированной системы.',
    count=20,
    is_active=True,
    category=categories['RAM']
)

Product.objects.create(
    name='Оперативная память Corsair Vengeance LPX 16GB DDR4 3200MHz',
    price=35000,
    description='Corsair: конфигурация 16 ГБ · DDR4 · 3200 МГц для мощной и сбалансированной системы.',
    count=50,
    is_active=True,
    category=categories['RAM']
)

Product.objects.create(
    name='Оперативная память G.Skill Trident Z5 RGB 32GB DDR5 6000MHz',
    price=110000,
    description='G.Skill: конфигурация 32 ГБ · DDR5 · 6000 МГц для мощной и сбалансированной системы.',
    count=15,
    is_active=True,
    category=categories['RAM']
)

# Videocards
Product.objects.create(
    name='Видеокарта MSI GeForce RTX 4060 8GB',
    price=220000,
    description='MSI: конфигурация RTX 4060 для мощной и сбалансированной системы.',
    count=10,
    is_active=True,
    category=categories['Видеокарты']
)

Product.objects.create(
    name='Видеокарта GIGABYTE GeForce RTX 4070 12GB',
    price=450000,
    description='GIGABYTE: конфигурация RTX 4070 для мощной и сбалансированной системы.',
    count=5,
    is_active=True,
    category=categories['Видеокарты']
)

Product.objects.create(
    name='Видеокарта ASUS TUF Gaming Radeon RX 7800 XT 16GB',
    price=380000,
    description='ASUS: компонент для стабильной производительности в современных сборках ПК.',
    count=8,
    is_active=True,
    category=categories['Видеокарты']
)

# CPUs
Product.objects.create(
    name='Процессор AMD Ryzen 5 5600X',
    price=85000,
    description='AMD: конфигурация 6 ядер · 3.7 ГГц для мощной и сбалансированной системы.',
    count=30,
    is_active=True,
    category=categories['Процессоры']
)

Product.objects.create(
    name='Процессор Intel Core i5-12400F',
    price=75000,
    description='Intel: конфигурация 6 ядер · 2.5 ГГц для мощной и сбалансированной системы.',
    count=40,
    is_active=True,
    category=categories['Процессоры']
)

Product.objects.create(
    name='Процессор AMD Ryzen 7 7800X3D',
    price=250000,
    description='AMD: конфигурация 8 ядер · 4.2 ГГц для мощной и сбалансированной системы.',
    count=10,
    is_active=True,
    category=categories['Процессоры']
)

print('Database populated successfully!')
