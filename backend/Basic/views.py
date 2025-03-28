from Basic.models import Basic_state, Basic_district, Basic_subdistrict, Basic_village, Population_2011
from Basic.serializers import StateSerializer,DistrictSerializer,SubDistrictSerializer,VillageSerializer
from django.http import Http404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import math

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
        single_year = request.data['year']
        start_year = request.data['start_year']
        end_year = request.data['end_year']
        villages = request.data['villages_props']
        subdistrict = request.data['subdistrict_props']
        total_population = request.data['totalPopulation_props']
        
        # Extract subdistrict IDs
        subdistrict_new_ids = [x['id'] for x in subdistrict]
        print("subdistrict_new_ids", subdistrict_new_ids)
        
        # Get population data for subdistricts
        subdistrict_2011 = list(Population_2011.objects.filter(
            subdistrict_code__in=subdistrict_new_ids
        ).values(
            'subdistrict_code', 'population_1951', 'population_1961', 
            'population_1971', 'population_1981', 'population_1991', 
            'population_2001', 'population_2011'
        ))
        
        # Extract population values for each decade
        p1 = [x['population_1951'] for x in subdistrict_2011]
        p2 = [x['population_1961'] for x in subdistrict_2011]
        p3 = [x['population_1971'] for x in subdistrict_2011]
        p4 = [x['population_1981'] for x in subdistrict_2011]
        p5 = [x['population_1991'] for x in subdistrict_2011]
        p6 = [x['population_2001'] for x in subdistrict_2011]
        p7 = [x['population_2011'] for x in subdistrict_2011]
        
        # Calculate the total population for each decade
        total_p1 = sum(p1)
        total_p2 = sum(p2)
        total_p3 = sum(p3)
        total_p4 = sum(p4)
        total_p5 = sum(p5)
        total_p6 = sum(p6)
        total_p7 = sum(p7)
        
        # Calculate decadal population differences correctly
        d_values = [
            total_p2 - total_p1,
            total_p3 - total_p2,
            total_p4 - total_p3,
            total_p5 - total_p4,
            total_p6 - total_p5,
            total_p7 - total_p6
        ]
        
        # Calculate mean decadal change and annual growth rate
        d_mean = sum(d_values) / len(d_values)
        annual_growth_rate = math.floor(d_mean / 10)
        
        print("villages props")
        output_year = {}
        
        if single_year:
            target_year = int(single_year)
            # Process each village
            for village in villages: 
                print("village", village)
                village_id, value = village['id'],village['population']  # Assuming villages is a dictionary
                output_year[village_id] = {
                    "2011": value,
                    str(target_year): int(value + ((annual_growth_rate * (target_year - base_year)) * (value / total_p7)))
                }
        elif start_year and end_year:
            # Handle range of years if needed
            start_yr = int(start_year)
            end_yr = int(end_year)
            
            for village_id, value in villages.items():
                output_year[village_id] = {"2011": value}
                for year in range(start_yr, end_yr + 1):
                    if year != 2011:  # Skip base year
                        projected_pop = int(value + ((annual_growth_rate * (year - base_year)) * (value / total_p7)))
                        output_year[village_id][str(year)] = projected_pop
        
        print("output", output_year)
        return Response(output_year, status=status.HTTP_200_OK)


    