export const hasCollisionType = (initialType, targetType) => {
    return (initialType & targetType) > 0;
}