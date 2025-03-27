from Basic.models import Basic_state, Basic_district, Basic_subdistrict, Basic_village
from Basic.serializers import StateSerializer,DistrictSerializer,SubDistrictSerializer,VillageSerializer
from django.http import Http404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

class Locations_stateAPI(APIView):
    def get(self,request,format=None):
        states=Basic_state.objects.all()
        serial=StateSerializer(states,many=True)
        return Response(serial.data,status=status.HTTP_200_OK)
    
class Locations_districtAPI(APIView):
    def post(self,request,format=None):
        district=Basic_district.objects.all().filter(state_code=request.data['state_code'])
        serial=DistrictSerializer(district,many=True)
        return Response(serial.data,status=status.HTTP_200_OK)
    
class Locations_subdistrictAPI(APIView):
    def post(self,request,format=None):
        print(request.data['district_code'])
        subdistrict=Basic_subdistrict.objects.all().filter(district_code__in=request.data['district_code'])
        serial=SubDistrictSerializer(subdistrict,many=True)
        return Response(serial.data,status=status.HTTP_200_OK)

class Locations_villageAPI(APIView):
    def post(self,request,format=None):
        village=Basic_village.objects.all().filter(subdistrict_code__in=request.data['subdistrict_code'])
        serial=VillageSerializer(village,many=True)
        return Response(serial.data,status=status.HTTP_200_OK)


    