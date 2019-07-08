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
const var playableRange = Synth.getMidiProcessor("playableRange");
const var sustainRoundRobin = Synth.getMidiProcessor("sustainRoundRobin");

//Get samplers as child synths
const var samplerIds = Synth.getIdList("Sampler");
const var childSynths = {};

for (id in samplerIds)
{
    childSynths[id] = Synth.getChildSynth(id);
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
    local range = Manifest.patches[patch].range;
    
    for (i = 0; i < 128; i++)
    {
        if (i < range[0] || i > range[1])
            Engine.setKeyColour(i, Colours.withAlpha(Colours.black, 0.5));
        else
            Engine.setKeyColour(i, Colours.withAlpha(Colours.white, 0.0));    
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
    local range = Manifest.patches[patch].range;
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
 