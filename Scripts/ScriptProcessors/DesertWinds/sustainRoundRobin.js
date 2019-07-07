reg rr = 0;

//GUI
const var knbRRs = Content.addKnob("Num RR", 0, 0)
knbRRs.setRange(0, 8, 1);

const var knbLow = Content.addKnob("Low Note", 150, 0);
knbLow.setRange(0, 127, 1);

const var knbHigh = Content.addKnob("High Note", 300, 0);
knbHigh.setRange(0, 127, 1);
knbHigh.set("defaultValue", 127);

const var knbOffset = Content.addKnob("Offset", 450, 0)
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
 