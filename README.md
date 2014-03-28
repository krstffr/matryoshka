Matryoshka
==========

### What is Matryoshka?

Matryoshka is Meteor.js package for creating nestable documents for storing in MongoDB. If you for example want to create "Page" documents where you're able to put freely put "PageParts" (like an ImageSlideShow, or a MainMenu, or a UserProfile) then Matyoshka is for you. Or maybe you want to create "GroupsOfPeople" documents where you put "People" documents, then Matryoshka is for you.

**This README is not done yet.**

### OK so how do I use this?

First you'll define what kinds of nestable documents you want, and which documents will nest inside which. You'll be able to define what fields a document will have, and Matryoshka will then give you a GUI where you create and edit your documents.

### Example

**Installation**

```
$ mrt add matryoshka
```

Matryoshka (and it's dependencies) should now be added to your Meteor.js app.

**Usage**

Let's say you want to create nestable russian dolls. Below is how you'd do that.

```javascript

// Do this on the client. For example on startup.
Meteor.startup(function () {
    
    // This will create a nestableType called "nestableDoll" which is createable from the GUI
    Matryoshka.nestables.addType({ name: 'nestableDoll', createable: true });
    
    // This will create an actual doll object
    Matryoshka.nestables.add({
        // Give the part a name
        nestableName: 'russianGeneralDoll',
        // A readable version of the name
        nestableNameReadable: 'Russian Doll (general)',
        // Here you set which type the object should have (we choose the one we defined above of course
        type: 'nestableDoll',
        // These fields will be editable for the object
        fields: [
            // This is a text field
            { name: 'dollName', type: 'text' },
            // This will be a selectable field with three options
            { name: 'dollSize', type: 'select', selectableData: [
                    { name: 'Large' }, { name: 'Medium' }, { name: 'Small' }, { name: 'Super small' }
                ]
            }
        ],
        // Here we define what nestable types should be nestabled inside this nestable
        nestables: [{ name: 'nestableDoll' }]
    });
    
    // Now if you go to route /matryoshka in your app you'll be able to create dolls which are nestable

});

```

**A more advanced example**

There are lot's of more options as well.

```javascript

// This will create another doll object with some more advanced options
Matryoshka.nestables.add({
    nestableName: 'siberianDoll',
    nestableNameReadable: 'Siberian Doll',
    type: 'nestableDoll',
    // This nestable will not be creatable on it's own, but rather only as a child to other nestables
    nestableCreateable: false,
    // You can define you own fields which will be stored inside the nestable
    homeLocation: 'Siberia!',
    fields: [
        { name: 'dollName', type: 'text' },
        { name: 'dollSize', type: 'select', selectableData: [
                { name: 'Large' }, { name: 'Medium' }, { name: 'Small' }, { name: 'Super small' }
            ]
        },
        // You can ouput stuff you've defined yourself as a non-editable field using the "locked" type
        // In this case it will output "Siberia!" cause that's what we defined above
        { name: 'homeLocation', type: 'locked' },
        // You can also use textareas instead of text inputs if you need to enter longer texts
        { name: 'dollBackgroudBio', type: 'textarea' },
        // This <select> element will use a mongo Collection for it's selectable values 
        { name: 'dollHomeVillage', type: 'select', selectableData: {
                // It's the type: 'collection' which makes the selectable data come from a collection instead of
                // values you define here.
                type: 'collection',
                // This SiberianVillages mongo collection will be used to populate the <option> elements
                collectionName: 'SiberianVillages',
                // The villageName key will be used for the value for the <option> elements
                collectionField: 'villageName',
                // Here you can define a selector for the query which will populate the <select> element
                collectionSelector: { villageState: 'Siberia', population: { $gt: 5000 } }
            }
        },
        // This text input will store the values in MongoDB as number type
        { name: 'dollHeight', type: 'text', number: true },
        // This select value will also add a css class to the containing <div class="matryoshka__nestable__container">
        // In this case it will look like this:
        // <div class="matryoshka__nestable__container dollCssClass--dollRed">
        // And you can then set styles for .dollCssClass--dollRed yourself in your css
        { name: 'dollCssClass', type: 'select', cssOutputValueAsClass: true, selectableData: [
                { name: 'dollPurple' }, { name: 'dollRed' }, { name: 'dollGreen' }
            ]
        },
        // If you input a valid imgSrc in the dollImageSrc you will see a preview of the image next to the element
        { name: 'dollImageSrc', type: 'text', imagePreview: true }
    ],
    fieldsTypeSpecific: [
        {
            // These options will only change if you set the dollSize value to something specific
            name: 'dollSize',
            // In this case, if you set dollSize to "Super small" you'll also get these options
            "Super small": [
                // So if the user sets dollSize to "Super small" he/she will be able to specify how tiny the doll
                // is in this text field. You can use all kinds of fields (like the more advanced ones defined above) 
                // here. You can also add fields which are specific to these fields. For example, you could add
                // a specific field for howTinyIsIt: "Microscopic", which the user could only access if he/she
                // first set dollSize to "Super small" and then inserted "Microscopic" to the howTinyIsIt text field
                { name: 'howTinyIsIt', type: 'text' }
            ]
        }
    ],
    // This nestable will ONLY allow siberianDolls to nest inside it (and not the general russian one we defined above)
    nestables: [{ name: 'nestableDoll', nestables: ['siberianDoll'] }]
});


```

### Linked nestables

Another thing you can do is create a nestable, and then link this nestable into another. Any changes you make to this linked nesatable will then be reflected in all places you've linked it. For example, if you create a Page nestable inside which you put a MainMenu nestable, you might want to use the same MainMenu on lot's of other Pages. So you'd create a MainMenu and then link it to all pages, and now you'd only need to make changes to the MainMenu in one place.

### Silly example

So this is a really silly example. But you could use it as a CMS for actual sub pages which contain page parts. This would give you a quite flexible CMS for your data which would be easy to add modules to, add specific fields to modules etc.

### The output of all this

You'll have to create a app/whatever which then uses the data you create and store. That's up to you. In the future I might add an example as to how you might accomplish this.
