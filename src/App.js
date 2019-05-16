import React, { useState } from "react";
import { Form, Select, Scope, Input } from "@rocketseat/unform";
import * as Yup from "yup";
import _ from "lodash";
import Highlight from "react-highlight.js";
import { CopyToClipboard } from "react-copy-to-clipboard";

const schema = Yup.object().shape({
  table: Yup.string().required("Nome da Tabela é obrigatório"),
  fields: Yup.array().of(
    Yup.object().shape({
      legend: Yup.string().required("Nome do Campo é obrigatório"),
      type: Yup.string().required("Tipo do Campo é obrigatório")
    })
  )
});

const App = () => {
  const [sql, setSql] = useState(
    "/* Defina o nome da tabela e adicione\n   os campos necessários */"
  );
  const [copied, setCopied] = useState(false);
  const [data, setData] = useState({
    fields: [{}]
  });

  const types = [
    {
      id: "varchar",
      title: "Varchar"
    },
    {
      id: "double",
      title: "Valor"
    },
    {
      id: "text",
      title: "Texto"
    },
    {
      id: "int",
      title: "Inteiro"
    },
    {
      id: "date",
      title: "Data"
    },
    {
      id: "datetime",
      title: "Data Hora"
    }
  ];

  function handleSubmit(data) {
    setCopied(false);
    const tableName = _.snakeCase(data.table);
    const sqlFields = [];

    sqlFields.push(
      `  \`ID_${tableName.toUpperCase()}\` INT AUTO_INCREMENT NOT NULL`
    );
    if (data.fields) {
      data.fields
        .filter(n => n)
        .forEach(field => {
          let typeField = "";
          switch (field.type) {
            case "double":
              typeField = "DOUBLE (11,2)";
              break;
            case "text":
              typeField = "TEXT";
              break;
            case "int":
              typeField = "INT (11)";
              break;
            case "date":
              typeField = "DATE";
              break;
            case "datetime":
              typeField = "DATETIME";
              break;
            default:
              typeField = "VARCHAR (200)";
          }
          sqlFields.push(
            `  \`${_.snakeCase(
              field.legend
            ).toUpperCase()}_${tableName.toUpperCase()}\` ${typeField} NOT NULL COMMENT '${
              field.legend
            }'`
          );
        });
    }
    sqlFields.push(`  PRIMARY KEY(\`ID_${tableName.toUpperCase()}\`)`);
    setSql(`CREATE TABLE \`${tableName}\` (\n${sqlFields.join(",\n")}\n)`);
  }

  function addField() {
    setData({ fields: [...data.fields, {}] });
  }

  function handleDelete(index) {
    var array = data.fields;
    delete array[index];
    setData({ fields: array });
  }

  return (
    <div className="content">
      <div id="form">
        <Form schema={schema} onSubmit={handleSubmit}>
          <Input placeholder="Nome da Tabela" name="table" />
          <ul className="listFields">
            {data.fields.map(
              (field, fieldIndex) =>
                field && (
                  <li key={fieldIndex}>
                    <Scope path={`fields[${fieldIndex}]`}>
                      <Input name="legend" placeholder="Nome do Campo" />
                      <Select name="type" options={types} />
                      <button
                        type="button"
                        onClick={() => handleDelete(fieldIndex)}
                      >
                        X
                      </button>
                    </Scope>
                  </li>
                )
            )}
            <button type="button" onClick={() => addField()}>
              Adicionar campo
            </button>
          </ul>

          <button type="submit">Enviar</button>
        </Form>
      </div>
      <pre id="sql">
        <Highlight language="javascript">{sql}</Highlight>
        <CopyToClipboard onCopy={() => setCopied(true)} text={sql}>
          <button>{copied ? "Copiado para Clipboard" : "Copiar Query"}</button>
        </CopyToClipboard>
      </pre>
    </div>
  );
};

export default App;
