# VISUALIZING BIRD MIGRATION PATTERNS

## Links

### Website: https://isha-talegaonkar.github.io/dataviscourse-bird_migration/

### Process Book: https://docs.google.com/document/d/1DofONKr_HHTSAdtSqj9tST3eYguAdC3qeP2wWqFuRoU/edit

## How to run this project

* Download the project from github
* Go to the project directory
* Run the comand -> python3 -m http.server 8000
* It opens index.html by default were we can view the project.

## Code organization

1. index.html file which is the main file
2. css folder styles.css file for all styling purposes
3. js folder contains script.js that has the code for creating all the visualizations.

## Data

The data was taken from https://science.ebird.org/en/use-ebird-data/download-ebird-data-products
The data folder has 4 files for 4 bird species and 1 file for metadata.json mapdata.json

Whole dataset can be found in https://drive.google.com/drive/folders/1o5cAQaXMaBYKIAnEq6Vxp2B91M5_i0wW

PS: We had to remove the data before uploading to github due to storage constraint

## The bird folders contain

1. Images of the bird and conservation status
2. csv file containing the filtered dataset of the bird
3. csv file containg the count of the weekly sighting of the bird
