import expressServer from "./app";

const PORT = 8181;

expressServer.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});