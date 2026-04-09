from .generics import (
    ProductListAPIView,
    ProductDetailAPIView,
    CategoryListAPIView,
    CategoryDetailAPIView,
    CategoryProductsAPIView,
)

# To switch implementations, replace the imports above with:
# from .fbv import products_list, product_detail
# from .cbv import ProductListAPIView, ProductDetailAPIView
# from .mixins import ProductListAPIView, ProductDetailAPIView
