//// TODO ---- BUILD IN FULL HANDLING OF RUBRIC ZIP FILES INCLUDING UNZIP,
//// FILE PARSING, AND THEN RUBRICS.XML OUTPUT FOR PLACEMENT IN A CANVAS .IMSCC FILE


const convert       = require('xml-js')
const xml           = require('fs').readFileSync('./rubric-files/rubric.xml', 'utf8')
const options       = {ignoreComment: true, compact: true}
const fs            = require('fs')

let res = convert.xml2js(xml, options);
let rubric = res.LEARNRUBRICS.Rubric;
let criteria = rubric.RubricRows.Row;

function ratingsPopulate (ratings, criterion) {
    const pop = ratings.map(function(rating) {
        let newR = {
            'description'      : rating.Header._attributes.value,
            'points'           : rating.Cell.NumericPoints._attributes.value,
            'criterion_id'     : criterion._attributes.id,
            'long_description' : rating.Cell.CellDescription._attributes.value,
            'id'               : rating.Cell._attributes.id 
        }
        function cleanLD (newR) {
            for (var long_description in newR) {
                if (newR[long_description] === null || newR[long_description] == undefined) {
                    delete newR[long_description]
                }
            }
            return newR
        }
        return cleanLD(newR)
    })
    return pop
}

function criterionPopulate(criteria) {
    const crit = criteria.map(function(criterion) {
        ratings = criterion.RubricColumns.Column
        output = {
            'criterion_id'     : criterion._attributes.id,
            'points'           : criterion.RubricColumns.Column[0].Cell.NumericPoints._attributes.value,
            'description'      : criterion.Header._attributes.value,
            'ratings'          : {
                'rating' : ratingsPopulate(ratings, criterion)
            }
        }
        return output
    })
    return crit
}

const canvasObj = {
    '_declaration': res._declaration,
    'rubrics' : {
        '_attributes' : {
            'xmlns'	:	'http://canvas.instructure.com/xsd/cccv1p0',
            'xmlns:xsi'	:	'http://www.w3.org/2001/XMLSchema-instance',
            'xsi:schemaLocation'	:	'http://canvas.instructure.com/xsd/cccv1p0 https://canvas.instructure.com/xsd/cccv1p0.xsd'
        },
        'rubric' : [
            {
                'read_only' : false,
                'title' : rubric.Title._attributes.value,
                'reusable' : false,
                'public' : false,
                'points_possible' : rubric.MaxValue._attributes.value,
                "description" : rubric.Description._value,
                'criteria' : {
                    'criterion' : criterionPopulate(criteria)
                },
                '_attributes': {
                    'identifier': 'g0354c109dcabee8ea01753b8af21baae'
                }
            }
        ]
    }
}
 

const xmlOptions = {compact: true, ignoreComment: true, spaces: 4, fullTagEmptyElement: true};
const xmlOut = convert.js2xml(canvasObj, xmlOptions)

fs.writeFile('rubrics.xml', xmlOut, function(err, data) {
    if (err) {
        console.log(err);
    }
    else {
        console.log('file remapped!')
    }
})

