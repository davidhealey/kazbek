/*
    Copyright 2019 David Healey

    This file is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

Content.makeFrontInterface(650, 570);

include("manifest.js");
include("settings.js");
include("preloadBar.js");
include("HISE-Scripting-Framework/libraries/paths.js");

Synth.deferCallbacks(true);

//Fonts
Engine.loadFontAs("{PROJECT_FOLDER}Fonts/oxygen.regular.ttf", "Oxygen-Regular");
Engine.loadFontAs("{PROJECT_FOLDER}Fonts/oxygen.light.ttf", "Oxygen-Light");
Engine.loadFontAs("{PROJECT_FOLDER}Fonts/oxygen.bold.ttf", "Oxygen-Bold");

//Value popup styling
Content.setValuePopupData(
{
    "fontName": "Oxygen-Bold",
    "fontSize": 18,
    "itemColour": 0xFFE3E2DB,
    "itemColour2": 0xFFE3E2DB,
    "textColour": 0xFF6C5C1E,
    "borderSize": 0
});

//Script processors
const var legato = Synth.getMidiProcessor("legato");
const var playableRange = Synth.getMidiProcessor("playableRange");
const var sustainRoundRobin = Synth.getMidiProcessor("sustainRoundRobin");

//Modulators
const var dynamicsCC = Synth.getModulator("dynamicsCC");

//Get samplers as child synths
const var samplerIds = Synth.getIdList("Sampler");
const var childSynths = {};

for (id in samplerIds)
{
    childSynths[id] = Synth.getChildSynth(id);
}  

//Menu and pages
const var pnlMenu = Content.getComponent("pnlMenu");
const var menuLabels = ["MIXER", "VELOCITY", "EXPRESSION", "DYNAMICS", "VIBRATO", "LEGATO", "SETTINGS"];
pnlMenu.data.itemHeight = 25;
pnlMenu.data.numRows = menuLabels.length;
pnlMenu.data.verticalOffset = 25;

//Add pages to array
const var pages = [];
for (i = 0; i < menuLabels.length; i++)
{
    pages[i] = Content.getComponent("page"+i);
}

//Menu paint routine
pnlMenu.setPaintRoutine(function(g){
    
    g.fillAll(0x00);
    
    var voffset = this.data.verticalOffset;
    
    for (i = 0; i < menuLabels.length; i++)
    {
        i == this.getValue() ? g.setColour(0xFF746E58) : g.setColour(0xFF918A6F);
        i == this.getValue() ? g.setFont("Oxygen-Bold", 20) : g.setFont("Oxygen-Regular", 20);    
        g.drawAlignedText(menuLabels[i], [0, voffset+((this.data.itemHeight*2)*i), this.getWidth(), this.data.itemHeight], "left");
    }
});

//Menu mouse callback
pnlMenu.setMouseCallback(function(event)
{
    if (event.clicked)
    {
        var voffset = this.data.verticalOffset;
        var height = voffset+((this.data.itemHeight * this.data.numRows) * 2);
        var value = parseInt(event.y / height * this.data.numRows);
        
        pnlMenu.setValue(value);
        pnlMenu.repaint();
        changePage(value);
    }
});

inline function changePage(p)
{
    for (i = 0; i < pages.length; i++)
    {
        pages[i].showControl(i == p);
    }
}

//Dynamics && breath control
inline function onknbDynamicsControl(component, value)
{
    dynamicsCC.setAttribute(dynamicsCC.DefaultValue, value);
    legato.setAttribute(legato.knbBreath, value);
}

Content.getComponent("knbDynamics").setControlCallback(onknbDynamicsControl);

//Vibrato UI
const var pnlXY = Content.getComponent("pnlXY"); //XY Pad
const var vibMods = []; //CC Modulators
const var knbVibrato = []; //Sliders

for (i = 0; i < 2; i++)
{
    vibMods[i] = Synth.getModulator("vibratoMod"+i);
    knbVibrato[i] = Content.getComponent("knbVibrato"+i);
    knbVibrato[i].setControlCallback(onVibratoSlider);
}

inline function onVibratoSlider(component, value)
{
    //Set modulator value
    for (i = 0; i < vibMods.length; i++)
    {
        vibMods[i].setAttribute(vibMods[i].DefaultValue, knbVibrato[i].getValue());
    }
    
    //Update XY pad
    pnlXY.changed();
    pnlXY.repaint();
}

pnlXY.setPaintRoutine(function(g){   
    
    //Background
    g.fillAll(0x33ACA793);
    
    //Get knob values as normalized percentage
    var intensity = knbVibrato[0].getValue() / 127;
    var rate = 1 - (knbVibrato[1].getValue() / 127);
   
    //Calculate dot position
    var x = Math.range(intensity * (this.getWidth()-10), 0, this.getWidth()-10);
    var y = Math.range(rate * (this.getHeight()-10), 0, this.getHeight()-10);
           
    //Draw dot
    g.setColour(0xFF817E6A);
    g.fillEllipse([x, y, 10, 10]);
});

pnlXY.setMouseCallback(function(event)
{
    if (event.clicked || event.drag)
    {       
        //Calculate new knob value normalized percentage
        var x = Math.range(event.x / this.getWidth(), 0, 1);
        var y = Math.range(event.y / this.getHeight(), 0, 1);
        
        //Update knob values
        knbVibrato[0].setValue(127 * x);
        knbVibrato[1].setValue(127-(127 * y));
        
        //Trigger knob callback to update modulators and repaint panel
        knbVibrato[0].changed();
        knbVibrato[1].changed();
    }
});

//Patch selector
reg patch;

Content.getComponent("cmbPatches").setControlCallback(oncmbPatchesControl);
inline function oncmbPatchesControl(component, value)
{
	patch = component.getItemText();
	colourKeys();
	loadSampleMaps();
	setPlayableRange();
	pnlPreset.showControl(false);
	btnPreset2.setValue(false);
	
    if(Engine.getCurrentUserPresetName() == "")
        Content.getComponent("lblPreset").set("text", "Duduk");
    else
        Content.getComponent("lblPreset").set("text", Engine.getCurrentUserPresetName());
};

//Set keyboard colours
inline function colourKeys()
{    
    local ranges = Manifest.patches[patch].range;
    
    for (i = 0; i < 128; i++)
    {
        if (i >= ranges[0][0] && i <= ranges[0][1])
            Engine.setKeyColour(i, Colours.withAlpha(Colours.white, 0.0));
        else if (i >= ranges[1][0] && i <= ranges[1][1])
            Engine.setKeyColour(i, Colours.withAlpha(Colours.yellow, 0.1));
        else if (i >= ranges[2][0] && i <= ranges[2][1])
            Engine.setKeyColour(i, Colours.withAlpha(Colours.green, 0.1));
        else if (i >= ranges[3][0] && i <= ranges[3][1])
            Engine.setKeyColour(i, Colours.withAlpha(Colours.red, 0.1));
        else
            Engine.setKeyColour(i, Colours.withAlpha(Colours.black, 0.3));            
    }   
}

//Load sample maps
inline function loadSampleMaps()
{
    local sampleMaps = Sampler.getSampleMapList();

    for (id in samplerIds) //Each sampler
    {
        childSynths[id].setBypassed(false); //Enable sampler

        if (id == "transitions") //Transitions sampler
        {
            childSynths[id].asSampler().loadSampleMap(patch + "_staccato"); //Load staccato sample map
        }
        else if (sampleMaps.contains(patch + "_" + id)) //Valid sample map for sampler ID
        {
            childSynths[id].asSampler().loadSampleMap(patch + "_" + id); //Load the sample map
        }
        else //No sample map found
        {
            childSynths[id].asSampler().loadSampleMap("empty"); //Load empty sample map for this sampler
        }
    }
}

//Set playable range for main samplers
inline function setPlayableRange()
{
    local range = Manifest.patches[patch].range[0];
    local rrOffset = Manifest.patches[patch].rrOffset;
    
    playableRange.setAttribute(playableRange.knbLow, range[0]);
    playableRange.setAttribute(playableRange.knbHigh, range[1]);
    
    sustainRoundRobin.setAttribute(sustainRoundRobin.knbLow, range[0]);
    sustainRoundRobin.setAttribute(sustainRoundRobin.knbHigh, range[1]);
    sustainRoundRobin.setAttribute(sustainRoundRobin.knbOffset, rrOffset);
}

//Preset handling
const var btnPreset = [];
btnPreset[0] = Content.getComponent("btnPreset0");
btnPreset[1] = Content.getComponent("btnPreset1");
btnPreset[0].setControlCallback(changePreset);
btnPreset[1].setControlCallback(changePreset);

inline function changePreset(component, value)
{
    if (value == 1)
    {
        local idx = btnPreset.indexOf(component);
        idx == 0 ? Engine.loadPreviousUserPreset(false) : Engine.loadNextUserPreset(false);
    }
}

const var btnPreset2 = Content.getComponent("btnPreset2");
btnPreset2.setControlCallback(openPresetBrowser);
const var pnlPreset = Content.getComponent("pnlPreset");

pnlPreset.setPaintRoutine(function(g)
{
    g.setGradientFill([0xFFE3E2DB, 150, 150, 0xFFE3DDCC, this.getWidth(), this.getHeight()]);
    g.fillRect([0, 0, this.getWidth(), this.getHeight()]);   
});

inline function openPresetBrowser(component, value)
{
    pnlDocs.showControl(false);
    btnHelp.setValue(0);
    pnlPreset.showControl(value);
}

//Help Button
const var btnHelp = Content.getComponent("btnHelp");

btnHelp.setPaintRoutine(function(g)
{
    this.data.hover ? g.setColour(this.get("itemColour")) : g.setColour(this.get("bgColour"));
    g.fillPath(Paths.fontawesome.solid["question-circle"], [0, 0, this.getWidth(), this.getHeight()]);
});

btnHelp.setMouseCallback(function(e)
{    
    if (e.mouseUp)
    {
        this.setValue(1-this.getValue());
        this.changed();
    }        
    else
    {
        this.data.hover = e.hover;
        this.repaint();
    }
});

btnHelp.setControlCallback(onbtnHelpControl);
inline function onbtnHelpControl(component, value)
{
    pnlPreset.showControl(false);
    btnPreset2.setValue(0);
	pnlDocs.showControl(value);
};

//Documentation panel
const var pnlDocs = Content.getComponent("pnlDocs");

pnlDocs.setPaintRoutine(function(g)
{
    g.setGradientFill([0xFFE3E2DB, 0, 0, 0xFFE3DDCC, this.getWidth(), this.getHeight()]);
    g.fillRect([0, 0, this.getWidth(), this.getHeight()]);    
    
    g.setColour(0xFF222222);    
    g.fillRect([0, 0, 200, this.getHeight()]);
});

//URL button

inline function onbtnURLControl(component, value)
{
	Engine.openWebsite("https://librewave.com");
};

Content.getComponent("btnURL").setControlCallback(onbtnURLControl);

function onNoteOn()
{
	
}
 function onNoteOff()
{
	
}
 function onController()
{
	
}
 function onTimer()
{
	
}
 function onControl(number, value)
{
	
}
 