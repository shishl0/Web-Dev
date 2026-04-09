from django.urls import path
from . import views

urlpatterns = [
    path('categories/', views.CategoryListAPIView.as_view(), name='category_list'),
    path('categories/<int:category_id>/', views.CategoryDetailAPIView.as_view(), name='category_detail'),
    path('categories/<int:category_id>/products/', views.CategoryProductsAPIView.as_view(), name='category_products'),
    
    path('products/', views.ProductListAPIView.as_view(), name='product_list'),
    path('products/<int:product_id>/', views.ProductDetailAPIView.as_view(), name='product_detail'),
]
