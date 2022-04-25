export interface SourceDefinition {
    context: string;
    code: string;
    colour: string;
}

export const Contexts = ["NT"];

export const Sources = [
    { context: "NT", code: "Mk", colour: "red" },
    { context: "NT", code: "M", colour: "green" },
    { context: "NT", code: "L", colour: "blue" },
    { context: "NT", code: "Q", colour: "orange" },
];

export const getSource = (context: string, code: string) => {
    return Sources.find((source) => source.context === context && source.code === code);
};
