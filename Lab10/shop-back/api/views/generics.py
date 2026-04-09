from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from api.models import Category, Product
from api.serializers import CategorySerializer, ProductSerializer

class ProductListAPIView(generics.ListCreateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

class ProductDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    lookup_url_kwarg = 'product_id'

class CategoryListAPIView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class CategoryDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    lookup_url_kwarg = 'category_id'

class CategoryProductsAPIView(APIView):
    def get(self, request, category_id):
        from django.shortcuts import get_object_or_404
        category = get_object_or_404(Category, pk=category_id)
        products = category.products.all()
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)
