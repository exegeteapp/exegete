from django.contrib import admin
from django.urls import path, include
from .textapi.urls import urlpatterns as textapi
from . import views

v1api_patterns = [
    path("text/", include(textapi)),
    path("ping", views.ping),
]

urlpatterns = [
    path("api/v1/", include(v1api_patterns)),
    path('api/v1/auth/', include('dj_rest_auth.urls')),
    path("admin/", admin.site.urls),
]
