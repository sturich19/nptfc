import './header-styles.css';

interface HeaderAtomProps{
    headerText? : string
}

const HeaderAtom = (headerProps: HeaderAtomProps) => {

    return (
        <div className="header">
            <h4>{headerProps.headerText}</h4>
        </div>          
    )
}

export default HeaderAtom;