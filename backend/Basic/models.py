from django.db import models

# Create your models here.
class Basic_state(models.Model):
    state_code = models.IntegerField(primary_key=True)
    state_name = models.CharField(max_length=40)

    def __str__(self):
        return f"{self.state_name}"

class Basic_district(models.Model):
    district_code = models.IntegerField(primary_key=True)
    district_name = models.CharField(max_length=40)
    state_code = models.ForeignKey(Basic_state, to_field='state_code', on_delete=models.CASCADE)
    
    def __str__(self):
        return f"{self.district_name}"

class Basic_subdistrict(models.Model):
    subdistrict_code = models.IntegerField(primary_key=True)
    subdistrict_name = models.CharField(max_length=40)
    district_code = models.ForeignKey(Basic_district, to_field='district_code', on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.subdistrict_name}"

class Basic_village(models.Model):
    village_code = models.IntegerField(primary_key=True)
    village_name = models.CharField(max_length=100)
    population_2011 = models.IntegerField()
    subdistrict_code = models.ForeignKey(Basic_subdistrict, to_field='subdistrict_code', on_delete=models.CASCADE)
    
    def __str__(self):
        return f"{self.village_name} ({self.population_2011})"
    
class Population_2011(models.Model):
       subdistrict_code = models.IntegerField(primary_key=True)
       region_name = models.CharField(max_length=40)
       population_1951 = models.BigIntegerField()
       population_1961 = models.BigIntegerField()
       population_1971 = models.BigIntegerField()
       population_1981 = models.BigIntegerField()
       population_1991 = models.BigIntegerField()
       population_2001 = models.BigIntegerField()
       population_2011 = models.BigIntegerField()

       def __str__(self):
           return f"{self.region_name},{self.subdistrict_code},{self.population_1951},{self.population_1961},{self.population_1971},{self.population_1981},{self.population_1991},{self.population_2001},{self.population_2011}"
