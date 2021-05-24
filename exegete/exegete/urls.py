from django.contrib import admin
from django.urls import path, include
from .textapi.urls import urlpatterns as textapi
from . import views

v1api_patterns = [
    path("auth/", include("dj_rest_auth.urls")),
    path("text/", include(textapi)),
    path("ping", views.ping),
]

urlpatterns = [
    path("api/v1/", include(v1api_patterns)),
    path("admin/", admin.site.urls),
]
