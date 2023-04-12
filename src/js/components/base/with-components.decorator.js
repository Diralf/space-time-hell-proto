export function WithComponents(componentClasses) {
    return function (Class) {
        return class extends Class {
            constructor(...args) {
                super(...args);
                this.components = componentClasses.map((componentClass) => new componentClass(this));
            }

            update(dt) {
                super.update(dt);
                this.components.forEach((component) => component.update(dt));
            }

            getCollisionHandler(response, other) {
                return this.components
                    .filter(component => component.getCollisionHandler)
                    .map(component => component.getCollisionHandler(response, other))
                    [0];
            }

            draw(renderer) {
                super.draw(renderer);
                
                this.components.forEach((component) => component.draw(renderer));
            }
        };
    };
};
