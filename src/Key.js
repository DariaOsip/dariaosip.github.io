import {Slide} from "@mui/material";

const Key = ({letter}) => {
    return <div className="key">
        {
            letter.isShown && <Slide direction="down" in={true} appear={true} timeout={1000}>
                <p style={{ verticalAlign: 'center' }}>{letter.letter}</p>
            </Slide>
        }
    </div>;
}

export default Key;