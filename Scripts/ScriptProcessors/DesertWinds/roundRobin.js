const var offset = 17;
reg rr = 0;function onNoteOn()
{
    Message.setTransposeAmount(offset*rr);
	rr = (rr + 1) % 2;
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
 