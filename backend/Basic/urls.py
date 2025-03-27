from django.urls import path
from .views import Locations_stateAPI,Locations_districtAPI,Locations_subdistrictAPI,Locations_villageAPI,Time_series_Airthemitic
urlpatterns = [
    path("",Locations_stateAPI.as_view(),name="states"),
    path("district/",Locations_districtAPI.as_view(),name="districts"),
    path("subdistrict/",Locations_subdistrictAPI.as_view(),name="subdistricts"),
    path("village/",Locations_villageAPI.as_view(),name="villages"),
    path("time_series/arthemitic/",Time_series_Airthemitic.as_view(),name="time_series")
]