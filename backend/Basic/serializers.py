from rest_framework import serializers
from .models import Basic_state,Basic_district,Basic_subdistrict,Basic_village
class StateSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Basic_state
        fields = '__all__'  
    
class DistrictSerializer(serializers.ModelSerializer):
    class Meta:
        model = Basic_district
        fields = '__all__'  

class SubDistrictSerializer(serializers.ModelSerializer):
    class Meta:
        model = Basic_subdistrict
        fields = '__all__'  

class VillageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Basic_village
        fields = '__all__'  