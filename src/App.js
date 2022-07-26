import './App.css';
import {Button, FloatingLabel} from "react-bootstrap";
import Form from 'react-bootstrap/Form';
import 'bootstrap/dist/css/bootstrap.min.css';
import {useState} from "react";
import Key from "./Key";
import secret from "./constants/secret";
import questions from "./constants/questions";
import {Slide, Zoom} from "@mui/material";

function App() {
    const [text, setText] = useState('');
    const [currQuestionId, setCurrQuestionId] = useState(0);
    const [isInvalid, setIsInvalid] = useState(false);
    const [secretState, setSecretState] = useState(secret);

    const isAnswerCorrect = (text, answer) => text.toLowerCase() === answer.toLowerCase();

    const onSubmit = () => {
        setText('');
        const isCorrect = isAnswerCorrect(text, questions[currQuestionId].answer);
        if (isCorrect) {
            const letter = questions[currQuestionId].letter;
            setSecretState((prevState) =>
                prevState.map((item) => (
                    item.letter === letter ? ({...item, isShown: true}) : item)
                ));
            if (currQuestionId < 5) {
                setCurrQuestionId(currQuestionId + 1);
            }
            setIsInvalid(false);
        } else {
            setIsInvalid(true);
        }
    }

    return (
        <div className="App">
            <div className="container">
                <div className="secret">
                    {secretState.map(letter => <Key letter={letter}/>)}
                </div>

                <div className="question">
                    <Zoom in={true} appear={true} timeout={1000}>
                        <p>{questions[currQuestionId].text}</p>
                    </Zoom>
                </div>

                {/*<Slide in={true} appear={true} timeout={1000}>*/}
                {/*    <p className="question">*/}
                {/*        {questions[currQuestionId].text}*/}
                {/*    </p>*/}
                {/*</Slide>*/}

                <div className="form">
                    <FloatingLabel label="Enter your answer">
                        <Form.Control type="text" placeholder="Enter your answer"
                                      isInvalid={isInvalid}
                                      style={{width: '100%'}}
                                      value={text}
                                      onChange={(e) => setText(e.target.value)}/>
                    </FloatingLabel>
                    <Button variant="success" size="lg" onClick={onSubmit} disabled={currQuestionId === 5}>
                        Submit
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default App;
