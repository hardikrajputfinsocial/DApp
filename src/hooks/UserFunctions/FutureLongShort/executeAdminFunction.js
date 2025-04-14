const executeAdminFunction = async (contract, functionName, args) => {
    try {
        const tx = await contract[functionName](...args);
        await tx.wait();
        console.log(`${functionName} executed successfully`);
    } catch (error) {
        console.error(`Error executing ${functionName}:`, error);
    }
};

export default executeAdminFunction;
