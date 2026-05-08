export async function registrarUsuario({request}) {
    const formData = await request.formData();
    const postData = Object.fromEntries(formData);
    const id = postData?.id || ''; // vacío para nuevos usuarios
    const usuario = postData?.user;
    const password = postData?.password;
    const wantsToKeepSession = !!postData?.keepSession;
    const sessionToken = postData?.token;
}