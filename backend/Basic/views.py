from Basic.models import Basic_state, Basic_district, Basic_subdistrict, Basic_village, Population_2011
from Basic.serializers import StateSerializer,DistrictSerializer,SubDistrictSerializer,VillageSerializer
from django.http import Http404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import math
from .service import population_single_year,population_range,get_total_p7

class Locations_stateAPI(APIView):
    def get(self,request,format=None):
        states=Basic_state.objects.all()
        serial=StateSerializer(states,many=True)
        sorted_data = sorted(serial.data, key=lambda x: x['state_name'])
        return Response(sorted_data,status=status.HTTP_200_OK)
    
class Locations_districtAPI(APIView):
    def post(self,request,format=None):
        district=Basic_district.objects.all().filter(state_code=request.data['state_code'])
        serial=DistrictSerializer(district,many=True)
        sorted_data=sorted(serial.data,key=lambda x: x['district_name'])
        return Response(sorted_data,status=status.HTTP_200_OK)
    
class Locations_subdistrictAPI(APIView):
    def post(self,request,format=None):
        print(request.data['district_code'])
        subdistrict=Basic_subdistrict.objects.all().filter(district_code__in=request.data['district_code'])
        serial=SubDistrictSerializer(subdistrict,many=True)
        sorted_data=sorted(serial.data,key=lambda x: x['subdistrict_name'])
        return Response(sorted_data,status=status.HTTP_200_OK)

class Locations_villageAPI(APIView):
    def post(self,request,format=None):
        village=Basic_village.objects.all().filter(subdistrict_code__in=request.data['subdistrict_code'])
        serial=VillageSerializer(village,many=True)
        sorted_data=sorted(serial.data,key=lambda x:x ['village_name'])
        return Response(sorted_data,status=status.HTTP_200_OK)

class Time_series_Airthemitic(APIView):
    def post(self, request, format=None):
        base_year = 2011
        # Get data from request
        print('request_data is ',request.data)
        single_year = request.data['year']
        start_year = request.data['start_year']
        end_year = request.data['end_year']
        villages = request.data['villages_props']
        subdistrict = request.data['subdistrict_props']
        total_population = request.data['totalPopulation_props']
        
        output=0
        if single_year:
            output=population_single_year(base_year,single_year,villages,subdistrict)
        else:
            output=population_range(base_year,start_year,end_year,villages,subdistrict)
        print("output",output)
        return Response(output, status=status.HTTP_200_OK)


    