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

reg rr = 0;

//GUI
const var knbRRs = Content.addKnob("knbRRs", 0, 0)
knbRRs.set("text", "Num RRs");
knbRRs.setRange(0, 8, 1);

const var knbLow = Content.addKnob("knbLow", 150, 0);
knbLow.set("text", "Low Note");
knbLow.setRange(0, 127, 1);

const var knbHigh = Content.addKnob("knbHigh", 300, 0);
knbHigh.set("text", "High Note");
knbHigh.setRange(0, 127, 1);
knbHigh.set("defaultValue", 127);

const var knbOffset = Content.addKnob("knbOffset", 450, 0)
knbOffset.set("text", "Offset");
knbOffset.setRange(-127, 127, 1);function onNoteOn()
{
    Message.setTransposeAmount(knbOffset.getValue()*rr);
	rr = (rr + 1) % knbRRs.getValue();
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
 