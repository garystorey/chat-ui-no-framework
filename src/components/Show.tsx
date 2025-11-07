

type ShowProps = {
    when: boolean;
    children: React.ReactNode;
};

export const Show = ({when,children}:ShowProps) => {
    if (!when) {
        return null;
    }
    return <>{children}</>;
}

export default Show;