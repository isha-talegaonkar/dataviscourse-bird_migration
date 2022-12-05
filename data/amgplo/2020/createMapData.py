import pandas as pd
import json
import numpy as np
import math

from datetime import datetime


def timestamp(dt):
    epoch = datetime.utcfromtimestamp(0)
    return (dt - epoch).total_seconds() * 1000.0


id = 1
# Read file and set row number(s) to use as the column name(s)
df = pd.read_csv('ebd_amgplo_202001_202012_relOct-2022.csv', header=0)

df = df[["COMMON NAME", "OBSERVATION COUNT", "ATLAS BLOCK", "LATITUDE", "LONGITUDE", "OBSERVATION DATE",
         "TIME OBSERVATIONS STARTED", "DURATION MINUTES", "EFFORT DISTANCE KM", "EFFORT AREA HA", "LOCALITY", "COUNTRY", "STATE"]]


df['OBSERVATION DATE TIME'] = df['OBSERVATION DATE'] + \
    ':' + df['TIME OBSERVATIONS STARTED']

df = df[df['OBSERVATION DATE TIME'].notna()]
# df.loc[df['OBSERVATION COUNT'] == 'X', 'OBSERVATION COUNT'] = 1
df.drop(df.loc[df['OBSERVATION COUNT'] == 'X'].index, inplace=True)
df = df.sort_values(by='OBSERVATION DATE', ascending=True)
# print(observatioDateTime)
# Display DataFrame
print(df)

df.to_csv('out.csv')

# python object(dictionary) to be dumped
geoJsonObject = {
    "type": "FeatureCollection",
    "features": []
}

featuresArray = geoJsonObject["features"]
minDataValue = math.inf
maxDataValue = -math.inf
for index, row in df.iterrows():
    # print(row["OBSERVATION DATE TIME"])
    # print(row["OBSERVATION DATE TIME"][:4])
    # print(row["OBSERVATION DATE TIME"][5:7])
    # print(row["OBSERVATION DATE TIME"][8:10])
    # print(row["OBSERVATION DATE TIME"][11:13])
    # print(row["OBSERVATION DATE TIME"][14:16])
    # date_time = datetime.datetime(int(row["OBSERVATION DATE TIME"][:4]), int(
    #     row["OBSERVATION DATE TIME"][5:7]), int(row["OBSERVATION DATE TIME"][8:10]), int(row["OBSERVATION DATE TIME"][11:13]), int(row["OBSERVATION DATE TIME"][14:16]))
    minDataValue = min(minDataValue, int(row["OBSERVATION COUNT"]))
    maxDataValue = max(maxDataValue, int(row["OBSERVATION COUNT"]))

    observationTime = int(timestamp(datetime(int(row["OBSERVATION DATE TIME"][:4]), int(
        row["OBSERVATION DATE TIME"][5:7]), int(row["OBSERVATION DATE TIME"][8:10]), int(row["OBSERVATION DATE TIME"][11:13]), int(row["OBSERVATION DATE TIME"][14:16]))))
    duration = row["DURATION MINUTES"]
    if np.isnan(duration):
        duration = 0.0
    featureObject = {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [row["LONGITUDE"], row["LATITUDE"], int(row["OBSERVATION COUNT"])]
        },
        "properties": {
            "mag": int(row["OBSERVATION COUNT"]),
            # "place": row["LOCALITY"] + ',' + row["STATE"] + ',' + row["COUNTRY"],
            "place":  row["STATE"] + ',' + row["COUNTRY"],
            "time": observationTime,
            "title": "D " + str(duration) + " " + row["STATE"] + ',' + row["COUNTRY"],
            "depth": id,
            "duration": duration
        }
    }
    featuresArray.append(featureObject)

# the json file where the output must be stored
out_file = open("mapdata.json", "w")

json.dump(geoJsonObject, out_file, indent=4)

out_file.close()

# python object(dictionary) to be dumped
metaDataObject = {
    "id": id,
    "name": "American Golden-Plover",
    "minDataValue": minDataValue,
    "maxDataValue": maxDataValue
}
# the json file where the output must be stored
out_file = open("metadata.json", "w")

json.dump(metaDataObject, out_file, indent=4)

out_file.close()
