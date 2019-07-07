 function onNoteOn()
{
	if (Synth.isLegatoInterval())
	    Message.setVelocity(Math.min(Message.getVelocity(), 69));
	else
    {
        if (Message.getVelocity() >= 70)
        {
            Message.setStartOffset(Engine.getSamplesForMilliSeconds(50));
        }
    }
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
 