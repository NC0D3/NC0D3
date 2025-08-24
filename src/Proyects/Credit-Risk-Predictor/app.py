from flask import Flask, request, redirect, send_file, render_template_string, url_for, session,render_template
import os
import zipfile
import joblib
import pandas as pd
import sklearn
import jinja2

app = Flask(__name__)
app.secret_key = 'SUPER_SECRETA_CAMBIALA'  # Cambia esto por una clave segura en producción

ZIP_PATH = "model.zip"
EXTRACT_DIR = "/tmp/model" 
if not os.path.isdir(EXTRACT_DIR):
    with zipfile.ZipFile(ZIP_PATH, "r") as z:
        z.extractall(EXTRACT_DIR)
        
model_path = os.path.join(EXTRACT_DIR, "model.joblib")
model = joblib.load(model_path)

USER_VALIDO = "admin"
PASS_VALIDO = "12345"

@app.route('/', methods=['GET'])
def root():
    if session.get('logueado'):
        return redirect(url_for('registro'))
    else:
        return send_file('login.html')

@app.route('/login', methods=['POST'])
def login():
    usuario = request.form.get('usuario', '')
    password = request.form.get('password', '')
    if usuario == USER_VALIDO and password == PASS_VALIDO:
        session['logueado'] = True  # Marca la sesión como autenticada
        return redirect(url_for('registro'))
    else:
        mensaje = "<div style='color:red;text-align:center;'>Usuario o contraseña incorrectos</div>"
        with open('login.html', 'r', encoding='utf-8') as f:
            html = f.read()
        html = html.replace('</body>', f'{mensaje}</body>')
        return render_template_string(html)

@app.route('/registro', methods=['GET'])
def registro():
    # Solo deja pasar si está logueado
    if not session.get('logueado'):
        return redirect(url_for('root'))
    return send_file('registro.html')

@app.route('/registro', methods=['POST'])
def recibir_registro():
    if not session.get('logueado'):
        return redirect(url_for('root'))
    
    applicant = pd.DataFrame([{
        "person_age": int(request.form.get('edad', '')),
        "person_gender": request.form.get('genero', ''),
        "person_education": request.form.get('educacion', ''),
        "person_income": int(request.form.get('salario', '')),
        "person_emp_exp": int(request.form.get('xp', '')),
        "person_home_ownership": request.form.get('vivienda', ''),
        "loan_amnt": int(request.form.get('cantidad', '')),
        "loan_intent": request.form.get('intencion', ''),
        "loan_int_rate": 10.05,
        "loan_percent_income": int((request.form.get('cantidad', '')))/int((request.form.get('salario', '')*12)),
        "cb_person_cred_hist_length": int(request.form.get('HC', '')),
        "credit_score": int(request.form.get('Score', '')),
        "previous_loan_defaults_on_file": request.form.get('Deudor', '')
    }])
    prediction = model.predict(applicant)
    print("Approved!" if prediction[0] == 1 else "Rejected")    
    return render_template("resultado.html",
    nombre=request.form.get('nombre', ''),
    edad=request.form.get('edad', ''),
    genero=request.form.get('genero', ''),
    salario=request.form.get('salario', ''),
    aprobado=prediction[0]
    )

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('root'))

if __name__ == "__main__":

    app.run(debug=True)
