reg currentNote; //The note that is currently pressed
reg lastNote = -1; //The last note that was pressed
reg retriggerNote = -1;
reg lastVel = 1;
reg eventId;function onNoteOn()
{
    currentNote = Message.getNoteNumber();

	if (Synth.isLegatoInterval() && !Synth.isSustainPedalDown() && Engine.getNumVoices() > 0)
    {
        Message.setNoteNumber(lastNote);
        retriggerNote = lastNote;
    }
    else
    {
        Message.ignoreEvent(true);
        retriggerNote = -1;
    }
    
    lastNote = currentNote;
    lastVel = Message.getVelocity();
}function onNoteOff()
{    
    if (Message.getNoteNumber() == retriggerNote)
    {
        retriggerNote = -1;
    }
    
    if (Message.getNoteNumber() == lastNote && retriggerNote != -1 && Engine.getNumVoices() > 0)
    {
        eventId = Synth.playNote(lastNote, lastVel);
        Synth.addPitchFade(eventId, 0, Message.getCoarseDetune(), Message.getFineDetune());
        
        lastNote = retriggerNote;
    }
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
 