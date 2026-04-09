import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'shop_back.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import Category, Product

# Create superuser if it doesn't exist
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'admin')

# Clear existing db
Category.objects.all().delete()
Product.objects.all().delete()

# Create 4 Categories
cat_names = ['Laptops', 'Smartphones', 'Tablets', 'Accessories']
categories = []
for idx, name in enumerate(cat_names):
    categories.append(Category.objects.create(name=name))

# Create 20 products (5 for each category)
# Laptops (idx 0)
Product.objects.create(name='MacBook Pro 14', price=2000, description='Apple M2', count=10, is_active=True, category=categories[0])
Product.objects.create(name='Dell XPS 13', price=1500, description='Intel Core i7', count=15, is_active=True, category=categories[0])
Product.objects.create(name='ThinkPad X1 Carbon', price=1700, description='Business Laptop', count=12, is_active=True, category=categories[0])
Product.objects.create(name='Asus ROG Zephyrus', price=2200, description='Gaming Laptop', count=8, is_active=True, category=categories[0])
Product.objects.create(name='Acer Swift 3', price=800, description='Budget Laptop', count=20, is_active=True, category=categories[0])

# Smartphones (idx 1)
Product.objects.create(name='iPhone 14 Pro', price=1000, description='Apple Smartphone', count=50, is_active=True, category=categories[1])
Product.objects.create(name='Samsung Galaxy S23', price=900, description='Android Smartphone', count=45, is_active=True, category=categories[1])
Product.objects.create(name='Google Pixel 7', price=700, description='Google Smartphone', count=30, is_active=True, category=categories[1])
Product.objects.create(name='OnePlus 11', price=800, description='Fast Android Smartphone', count=25, is_active=True, category=categories[1])
Product.objects.create(name='Xiaomi 13', price=750, description='Xiaomi Smartphone', count=40, is_active=True, category=categories[1])

# Tablets (idx 2)
Product.objects.create(name='iPad Pro 11', price=800, description='Apple Tablet', count=25, is_active=True, category=categories[2])
Product.objects.create(name='Samsung Galaxy Tab S8', price=700, description='Android Tablet', count=20, is_active=True, category=categories[2])
Product.objects.create(name='Lenovo Tab P11', price=300, description='Budget Tablet', count=35, is_active=True, category=categories[2])
Product.objects.create(name='iPad Air', price=600, description='Mid-range Apple Tablet', count=40, is_active=True, category=categories[2])
Product.objects.create(name='Surface Pro 9', price=1000, description='Windows Tablet', count=15, is_active=True, category=categories[2])

# Accessories (idx 3)
Product.objects.create(name='AirPods Pro', price=250, description='Wireless Earbuds', count=100, is_active=True, category=categories[3])
Product.objects.create(name='Logitech MX Master 3X', price=100, description='Wireless Mouse', count=50, is_active=True, category=categories[3])
Product.objects.create(name='Keychron K2', price=80, description='Mechanical Keyboard', count=60, is_active=True, category=categories[3])
Product.objects.create(name='Sony WH-1000XM5', price=350, description='Noise Canceling Headphones', count=40, is_active=True, category=categories[3])
Product.objects.create(name='Anker PowerCore 10000', price=30, description='Power Bank', count=120, is_active=True, category=categories[3])

print('Database created, superuser check passed, categories and products populated.')
