from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from .models import Product, Category

def product_list(request):
    products = Product.objects.all()
    products_json = [p.to_json() for p in products]
    return JsonResponse(products_json, safe=False)

def product_detail(request, id):
    product = get_object_or_404(Product, id=id)
    return JsonResponse(product.to_json())

def category_list(request):
    categories = Category.objects.all()
    categories_json = [c.to_json() for c in categories]
    return JsonResponse(categories_json, safe=False)

def category_detail(request, id):
    category = get_object_or_404(Category, id=id)
    return JsonResponse(category.to_json())

def category_products(request, id):
    category = get_object_or_404(Category, id=id)
    products = category.products.all()
    products_json = [p.to_json() for p in products]
    return JsonResponse(products_json, safe=False)
