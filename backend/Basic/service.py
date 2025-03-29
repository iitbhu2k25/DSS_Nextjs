import math
from .models import Population_2011

def get_total_p7(subdistrict):
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
    return annual_growth_rate,total_p7

def population_single_year(base_year,single_year,villages,subdistrict):
    print("villages props")
    output_year = {}
    annual_growth_rate,total_p7=get_total_p7(subdistrict)
    if single_year:
        target_year = int(single_year)
        # Process each village
        for village in villages: 
            print("village", village)
            village_id, value = village['id'],village['population'] 
            output_year[village_id] = {
                "2011": value,
                str(target_year): int(value + ((annual_growth_rate * (target_year - base_year)) * (value / total_p7)))
            }
    return output_year


def population_range(base_year,start_year,end_year,villages,subdistrict):
    annual_growth_rate,total_p7=get_total_p7(subdistrict)
    start_yr = int(start_year)
    end_yr = int(end_year)
    output_year = {}        
    for village in villages:
        village_id, value = village['id'],village['population'] 
        output_year[village_id] = {"2011": value}
        for year in range(start_yr, end_yr + 1):
            if year != 2011:  
                projected_pop = int(value + ((annual_growth_rate * (year - base_year)) * (value / total_p7)))
            output_year[village_id][str(year)] = projected_pop
    return output_year


def geometry_single_year(base_year,single_year,villages,subdistrict):
    output_year = {}
    if single_year:
        target_year = int(single_year)
        # Process each village
        for village in villages: 
            village_id, value = village['id'],village['geometry'] 
            output_year[village_id] = {
                "2011": value,
                str(target_year): value
            }
    return output_year