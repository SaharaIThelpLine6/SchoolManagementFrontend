const Notepad = () => {
    MyObject = new ActiveXObject("WScript.Shell")
    function RunNotePad()
    {
        MyObject.Run("notepad.exe");
    }
    return (
        <div>
            <p>Opne notepad</p>
            <button onClick="RunNotePad()">notepad</button>
        </div>
    )
}
export default Notepad;