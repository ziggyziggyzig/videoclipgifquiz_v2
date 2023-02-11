export const Links = ({list, children}) => <div
    className={`overzichten_griditem_links font_sans_bold ${list || undefined}`}>{children}</div>
export const Rechts = ({list, children}) => <div
    className={`overzichten_griditem_rechts font_sans_normal ${list || undefined}`}>{children}</div>

export const Breed = ({id, className, style, children}) => <>
    <div
        id={id}
        style={style}
        className={`overzichten_griditem_breed font_sans_normal ${className}`}>
        {children}
    </div>
</>

export const Lijn = ({list}) => <div className={`overzichten_griditem_divider ${list || undefined}`}/>

