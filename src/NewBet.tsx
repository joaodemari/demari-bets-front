import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import React from "react";
import { cpfMask } from "./tools/cpfMask";
import { api } from "./lib/axios";
import { Bet } from "./App";

export function NewBetModal({
  addValidBet,
}: {
  addValidBet: (bet: Bet) => void;
}) {
  const [duplicateNumber, setDuplicateNumber] = useState(true);
  const [numbers, setNumbers] = useState<number[]>([]);
  const [cpf, setCpf] = useState("");
  const [name, setName] = useState("");
  const [surprise, setSurprise] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ok, setOk] = useState(false);

  const handleCpfInput = (e: React.FormEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;
    const maskedCpf = cpfMask(value);
    setCpf(maskedCpf);
  };
  const handleIsSurpriseChange = (e: React.FormEvent<HTMLInputElement>) => {
    e.currentTarget.checked ? setSurprise(true) : setSurprise(false);
    if (e.currentTarget.checked) {
      const numbers: number[] = [];
      do {
        const number = Math.floor(Math.random() * 50) + 1;
        if (!numbers.includes(number)) {
          numbers.push(number);
        }
      } while (numbers.length < 5);
      setNumbers(numbers);
      setDuplicateNumber(false);
    }
  };

  const ShowOk = () => {
    setOk(true);
    setTimeout(() => {
      setOk(false);
    }, 3000);
  };

  const allNumbersAreValid =
    numbers.every((number) => {
      return number >= 1 && number <= 50;
    }) &&
    numbers.length === 5 &&
    !duplicateNumber;
  console.log(allNumbersAreValid);
  console.log("duplicateNumber", duplicateNumber);
  console.log("numbers", numbers);

  const handleNumberChange = (
    e: React.FormEvent<HTMLInputElement>,
    index: number
  ) => {
    let inputValue = e.currentTarget?.value;
    if (inputValue.length == 0) {
      setNumbers((prev) => {
        const newNumbers = [...prev];
        newNumbers[index] = 0;
        return newNumbers;
      });
      return;
    }

    inputValue = inputValue.replace(/\D/g, "");
    if (inputValue.length > 2) {
      inputValue = inputValue.slice(0, 2);
    }

    let numberParsed = parseInt(inputValue, 10);
    numberParsed = isNaN(numberParsed) ? 0 : numberParsed;
    const invalidNumber =
      parseInt(inputValue[0], 10) >= 5 &&
      inputValue.length > 1 &&
      !(parseInt(inputValue[0], 10) == 5 && inputValue[1] == "0");
    if (invalidNumber) {
      numberParsed = parseInt(inputValue[0], 10);
      console.log(numberParsed);
      return;
    }

    setNumbers((prev) => {
      const newNumbers = [...prev];

      newNumbers[index] = numberParsed;
      return newNumbers;
    });

    if (numbers.includes(numberParsed)) {
      setDuplicateNumber(true);
    } else {
      setDuplicateNumber(false);
    }
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setIsSubmitting(true);
    const data = {
      user_name: name,
      user_cpf: cpf,
      numbers,
      surprise,
    };
    console.log(data);
    await api
      .post("/bets", data)
      .then((response: { data: { idUnico: number }; status: number }) => {
        if (response.status === 201) {
          ShowOk();
          addValidBet({
            numbers,
            idUnico: response.data.idUnico,
            user_name: name,
            user_cpf: cpf,
            surprise,
          });
        }
      });
    setIsSubmitting(false);
  };

  return (
    <Dialog.Portal>
      <Dialog.Overlay className="z-20 fixed w-screen h-screen inset-0 bg-black bg-opacity-75" />
      <Dialog.Content
        className="bg-white rounded-lg shadow z-20 w-full md:w-1/2 h-fit text-black"
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <div>
          <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-">
            <h3 className="text-lg font-semibold text-gray-900 ">
              Criar Nova Aposta
            </h3>
          </div>
          <form className="p-4 md:p-5" onSubmit={handleSubmit}>
            <div className="grid gap-4 mb-4 grid-cols-1">
              <div className="col-span-1 sm:col-span-1">
                <label className="block mb-2 text-sm font-medium text-gray-900">
                  Nome do apostador
                </label>
                <input
                  type="text"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 "
                  placeholder="Insira seu nome"
                  onInput={(e) => setName(e.currentTarget.value)}
                  required
                />
              </div>
              <div className="col-span-1 sm:col-span-1">
                <label
                  htmlFor="name"
                  className="block mb-2 text-sm font-medium text-gray-900 "
                >
                  CPF
                </label>
                <input
                  type="text"
                  value={cpf}
                  onInput={handleCpfInput}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                  placeholder="000.000.000-00"
                  maxLength={14}
                  required
                />
              </div>
              <div>
                <div>
                  <h2 className="mb-2 text-lg font-semibold text-gray-900 ">
                    Números da Aposta
                  </h2>
                  <div className="flex mb-2 space-x-2 rtl:space-x-reverse">
                    {[...Array(5)].map((_, index) => (
                      <input
                        onInput={(e) => handleNumberChange(e, index)}
                        type="text"
                        value={numbers[index]}
                        maxLength={2}
                        disabled={surprise}
                        className="disabled:opacity-70 block w-9 h-9 py-3 text-sm font-extrabold text-center text-gray-900 bg-white border border-gray-500 rounded-lg focus:ring-primary-500 focus:border-primary-500 "
                      />
                    ))}
                  </div>
                  <p
                    className={`mt-2 text-sm text-yellow-500 ${
                      !allNumbersAreValid ? "flex" : "hidden"
                    }`}
                  >
                    {!allNumbersAreValid ? "Números Inválidos para aposta" : ""}
                  </p>
                  <ul className="px-5 mb-4 max-w-md space-y-1 text-gray-500 list-disc list-insid">
                    <li>Números de 1 até 50</li>
                    <li>Números não podem repetir</li>
                  </ul>

                  <div className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      onInput={handleIsSurpriseChange}
                      className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 "
                    />
                    <label
                      htmlFor="default-checkbox"
                      className="ms-2 text-sm font-medium text-gray-900 "
                    >
                      Ativar o modo surpresinha?
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex w-full gap-2">
              <button
                type="submit"
                className="text-white items-center bg-indigo-700 hover:bg-indigo-800 focus:ring-4 focus:outline-none focus:ring-indigo-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={
                  isSubmitting || !allNumbersAreValid || cpf.length < 14
                }
              >
                Fazer Aposta
              </button>
              {ok && (
                <h2 className="p-2 bg-green-100 border border-green-300 text-green-700 rounded-lg">
                  Aposta realizada com sucesso!
                </h2>
              )}
            </div>
          </form>
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  );
}
