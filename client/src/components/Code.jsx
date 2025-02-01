import { Box } from "@chakra-ui/react";
import Navbar from "./Navbar";
import CodeEditor from './CodeEditor';

function Code() {
  return (
    <Box >
      <Navbar/>
      
      <CodeEditor />
    </Box>
  );
}

export default Code;
