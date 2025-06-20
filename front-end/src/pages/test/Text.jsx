import axios from 'axios';
import React from 'react'
import { useState } from 'react'

const Text = () => {
    const [text, setText] = useState('');

    const handleChange =()=>{
        setText(e.target.value);
    }
    
    return (
        <div>
            <input type="text" value={text} onChange={handleChange} />
        </div>
    )
}

export default Text
