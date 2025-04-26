// En la función de agregar gasto
const handleAddExpense = async (expenseData) => {
  try {
    const expenseRef = await addDoc(collection(db, 'expenses'), {
      ...expenseData,
      userId: user.uid,
      date: new Date(),
      timestamp: serverTimestamp()
    });
    
    toast.success('Gasto agregado exitosamente');
  } catch (error) {
    console.error('Error adding expense:', error);
    toast.error('Error al agregar el gasto');
  }
};