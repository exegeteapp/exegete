from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from rest_framework.decorators import api_view
from rest_framework.response import Response


@ensure_csrf_cookie
@api_view(["GET"])
def ping(request):
    return Response({"hello": "world"})