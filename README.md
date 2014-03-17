Matryoshka
==========

Meteor pacakge for nesting stuff inside other stuff, for example russian dolls inside russian dolls inside russian dolls. Or page layouts inside a web page. Or images inside an image gallery.

**Installation**

```
$ mrt add matroyshka
```

**Usage**

```javascript

// Add the nestable type parts to the Boxcms object
Boxcms.nestables.page = [];
Boxcms.nestables.pagePart = [];

// Add some actual parts to the types of parts
Boxcms.nestables.page.push({
	// Give the part a name
	nestableName: 'normalPage',
	// The type should be the same as the type
	type: 'page',
	// These fields will be editable
	fields: [
		// This is a text field (will be a text input)
        { name: 'headline', type: 'text' },
        // This will be a selectable field with three options
        { name: 'someCollThingToSelect', type: 'select', selectableData: [
            {
                name: 'Option 1'
            },
            {
                name: 'Option 2'
            },
            {
                name: 'The third option, which is the coolest'
            }]
        }
    ],
    // These fields will be selectable based on other options you make
    fieldsTypeSpecific: [
        {
        	// These options are bound to the someCollThingToSelect field
            name: 'someCollThingToSelect',
            // These fields will be available if you choose Option 1
            "Option 1": [
                { name: 'somethingSpecificForOption1', type: 'text' },
                { name: 'anotherSpecificField', type: 'text' }
            ],
            // These fields will be available if you choose Option 2
            "Option 2": [
                { name: 'somethingSpecificForOption2', type: 'text' }
            ]
        }
    ],
    // These are the nestables which will be available to this nestable
    nestables: [{ name: 'pagePart' }]
});

Boxcms.nestables.pagePart.push({
	nestableName: 'pagePart1maybeAReview',
	type: 'pagePart',
	fields: [
        { name: 'reviewerName', type: 'text' },
        { name: 'reivewScore', type: 'select', selectableData: [
        	{ name: '3 stars' }, { name: '2 stars' }, { name: '1 stars' }
        	]
        }
	],
    fieldsTypeSpecific: [
        {
            name: 'reivewScore',
            "3 stars": [
            	// You can of course use select input fields as well as text
                { name: 'extraRecommendedBadge', type: 'select', selectableData: [
		        	{ name: 'Hell yes!' }, { name: 'No...' }
		        	]
		        }
            ]
        },
       	// And you can have specific inputs based on other specifics
       	{
        	name: 'extraRecommendedBadge',
        	"Hell yes!": [
        		{ name: 'extraSuperRecommended', type: 'select', selectableData: [
        				{ name: 'Yes actually' }, { name: 'No it\'s not that good' }
        			]
        		}
        	]
        }
    ],
	// This pagePart can cotain other pageParts (just like a Matryoshka doll!!)
    nestables: [{ name: 'pagePart' }]
});

// And now if you go to localhost:3000/boxcms you will have an editable page where you can add pages with page parts.

```