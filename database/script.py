import pandas as pd
import numpy as np

# Read the original CSV file
# Note: Replace 'input.csv' with your actual CSV filename
def normalize_csv(input_file):
    try:
        # Read the CSV file
        df = pd.read_csv(input_file)
        
        # Clean up column names (remove any whitespace)
        df.columns = df.columns.str.strip()
        
        # Make sure all required columns exist
        required_columns = ['state_code', 'district_code', 'subdistrict_code', 
                           'village_code', 'region_name', 'population_2011']
        
        for col in required_columns:
            if col not in df.columns:
                print(f"Error: Required column '{col}' not found in the CSV")
                return
        
        # Convert scientific notation to integers if needed
        if df['population_2011'].dtype == object:
            df['population_2011'] = pd.to_numeric(df['population_2011'], errors='coerce')
        
        # Create states table (exclude country level - India)
        states_df = df[(df['district_code'] == 0) & 
                       (df['subdistrict_code'] == 0) & 
                       (df['village_code'] == 0) & 
                       (df['state_code'] != 0)].copy()
        
        states_df = states_df[['state_code', 'region_name']]
        states_df.rename(columns={'region_name': 'state_name'}, inplace=True)
        
        # Create districts table
        districts_df = df[(df['district_code'] != 0) & 
                         (df['subdistrict_code'] == 0) & 
                         (df['village_code'] == 0)].copy()
        
        districts_df = districts_df[['district_code', 'region_name', 'state_code']]
        districts_df.rename(columns={'region_name': 'district_name'}, inplace=True)
        
        # Create subdistricts table
        subdistricts_df = df[(df['subdistrict_code'] != 0) & 
                            (df['village_code'] == 0)].copy()
        
        subdistricts_df = subdistricts_df[['subdistrict_code', 'region_name', 'district_code']]
        subdistricts_df.rename(columns={'region_name': 'subdistrict_name'}, inplace=True)
        
        # Create villages table
        villages_df = df[df['village_code'] != 0].copy()
        villages_df = villages_df[['village_code', 'region_name', 'population_2011', 'subdistrict_code']]
        villages_df.rename(columns={'region_name': 'village_name', 
                                   'population_2011': 'population'}, inplace=True)
        
        # Save each table to a separate CSV file
        states_df.to_csv('states.csv', index=False)
        districts_df.to_csv('districts.csv', index=False)
        subdistricts_df.to_csv('subdistricts.csv', index=False)
        villages_df.to_csv('villages.csv', index=False)
        
        # Print summary
        print(f"Normalization complete. Created 4 CSV files:")
        print(f"1. states.csv: {len(states_df)} records")
        print(f"2. districts.csv: {len(districts_df)} records")
        print(f"3. subdistricts.csv: {len(subdistricts_df)} records")
        print(f"4. villages.csv: {len(villages_df)} records")
        
    except Exception as e:
        print(f"Error: {str(e)}")

# Example usage
if __name__ == "__main__":
    # Replace with your actual CSV filename
    input_file = "populationdata.csv"
    normalize_csv(input_file)