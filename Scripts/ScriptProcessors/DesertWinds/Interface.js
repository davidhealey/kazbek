/*
    Copyright 2019 David Healey

    This file is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

Content.makeFrontInterface(600, 500);

include("manifest.js");

//Script processors
const var legato = Synth.getMidiProcessor("legato");
const var playableRange = Synth.getMidiProcessor("playableRange");
const var sustainRoundRobin = Synth.getMidiProcessor("sustainRoundRobin");

//Modulators
const var vibratoIntensity = Synth.getModulator("vibratoIntensity");
const var randIntensity = Synth.getModulator("randIntensity");
const var dynamicsCC = Synth.getModulator("dynamicsCC");

//Get samplers as child synths
const var samplerIds = Synth.getIdList("Sampler");
const var childSynths = {};

for (id in samplerIds)
{
    childSynths[id] = Synth.getChildSynth(id);
}  

//Dynamics && breath control
inline function onknbDynamicsControl(component, value)
{
    dynamicsCC.setAttribute(dynamicsCC.DefaultValue, value);
    legato.setAttribute(legato.knbBreath, value);
}

Content.getComponent("knbDynamics").setControlCallback(onknbDynamicsControl);

//Vibrato intensity

inline function onknbVibratoIntensityControl(component, value)
{
	vibratoIntensity.setAttribute(vibratoIntensity.DefaultValue, value);
	randIntensity.setAttribute(randIntensity.DefaultValue, value);
};

Content.getComponent("knbVibratoIntensity").setControlCallback(onknbVibratoIntensityControl);

//CC buttons and tables
const var tblVelocity = Content.getComponent("tblVelocity");
const var btnCC = [];
const var tblCC = [];

for (i = 0; i < 4; i++)
{
    btnCC[i] = Content.getComponent("btnCC"+i);
    tblCC[i] = Content.getComponent("tblCC"+i);
    btnCC[i].setControlCallback(onbtnCCControl);
}

inline function onbtnCCControl(component, value)
{
    local idx = btnCC.indexOf(component);
    
    //Toggle buttons and show/hide selected table
    for (i = 0; i < tblCC.length; i++)
    {
        btnCC[i].setValue(i == idx && value == 1);
        tblCC[i].showControl(i == idx && value == 1);
    }        
    
    //If no button enabled show velocity table
    tblVelocity.showControl(1-value);
}

//Patch selector
reg patch;

Content.getComponent("cmbPatches").setControlCallback(oncmbPatchesControl);
inline function oncmbPatchesControl(component, value)
{
	patch = component.getItemText();
	colourKeys();
	loadSampleMaps();
	setPlayableRange();
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
            Engine.setKeyColour(i, Colours.withAlpha(Colours.black, 0.5));            
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
}function onNoteOn()
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
 