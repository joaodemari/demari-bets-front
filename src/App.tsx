import * as Dialog from "@radix-ui/react-dialog";
import { NewBetModal } from "./NewBet";
import { api } from "./lib/axios";
import { useEffect, useState } from "react";
import Loader from "./Loader";

export interface Bet {
  idUnico: number;
  user_name: string;
  user_cpf: string;
  numbers: number[];
  surprise: boolean;
}

interface numberAndCount {
  number: number;
  count: number;
}

export const App = () => {
  const [numbersAreDrawn, setNumbersAreDrawn] = useState(false);
  const [winners, setWinners] = useState<Bet[]>([]);
  const [numbers, setNumbers] = useState<number[]>([]);
  const [validBets, setValidBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(false);
  const [numbersAndCount, setNumbersAndCount] = useState<numberAndCount[]>([]);
  const [confirmation, setConfirmation] = useState(false);

  const makeNumbersDraw = async () => {
    setLoading(true);
    try {
      setConfirmation(false);
      setNumbersAreDrawn(true);
      const response: {
        data: {
          winners: Bet[];
          sortedNumbers: number[];
          numbersAndCount: numberAndCount[];
        };
      } = await api.post("/numbers-draw");
      setValidBets([]);
      setNumbersAndCount(
        response.data.numbersAndCount.sort((a, b) => {
          return b.count - a.count;
        })
      );
      setWinners(response.data.winners);
      setNumbers(response.data.sortedNumbers);
    } catch (e) {
      console.log(e);
    }
    setLoading(false);
  };

  const addAValidBet = (bet: Bet) => {
    setValidBets((prev) => {
      return [...prev, bet];
    });
  };

  const getValidBets = async () => {
    const response: { data: Bet[] } = await api.get("/bets");
    console.log(response.data);
    setValidBets(response.data);
  };

  useEffect(() => {
    getValidBets();
  }, []);

  return (
    <div className="h-screen w-screen bg-gradient-to-r from-indigo-950 from-10% to-slate-900 to-90% overflow-y-auto">
      <header className="text-4xl h-16 flex w-full justify-center items-center font-bold bg-slate-100">
        <h2 className="bg-gradient-to-r from-indigo-950 to-slate-900 text-transparent bg-clip-text">
          Demari Bets
        </h2>
      </header>
      <div className="flex flex-col items-center p-8 space-y-4">
        <div
          className={`grid grid-cols-2 md:w-1/2 gap-8 ${
            numbersAreDrawn ? "hidden" : "block"
          }`}
        >
          <Dialog.Root>
            <Dialog.Trigger asChild>
              <button
                disabled={numbersAreDrawn}
                className={`disabled:cursor-not-allowed py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700`}
              >
                Criar aposta
              </button>
            </Dialog.Trigger>
            <NewBetModal addValidBet={addAValidBet} />
          </Dialog.Root>
          <button
            onClick={
              confirmation ? makeNumbersDraw : () => setConfirmation(true)
            }
            disabled={numbersAreDrawn}
            className={`${
              confirmation
                ? "bg-green-600 text-white  hover:bg-green-700"
                : "bg-indigo-100 text-indigo-950 font-bold"
            } disabled:opacity-50 disabled:cursor-not-allowed py-2 rounded-lg`}
          >
            {confirmation
              ? "✅ Clique aqui para confirmar sorteio"
              : "🤑 Sortear números"}
          </button>
        </div>

        {numbersAreDrawn ? (
          loading ? (
            <div className="w-full flex justify-center">
              <Loader />
            </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex flex-col gap-6 text-white">
                {numbers.length > 0 && (
                  <div className="flex flex-col items-center space-y-4">
                    <h2 className="text-2xl font-medium">Números sorteados</h2>
                    <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                      {numbers.map((_, index) => (
                        <input
                          value={numbers[index]}
                          disabled
                          className="block w-9 h-9 py-3 text-sm font-extrabold text-center text-gray-900 bg-white border border-gray-500 rounded-lg focus:ring-primary-500 focus:border-primary-500 "
                        />
                      ))}
                    </div>
                  </div>
                )}
                {winners.length > 0 ? (
                  <div className="flex w-full flex-col items-center gap-6">
                    <h2 className="text-2xl font-medium">Ganhadores</h2>
                    <div className="flex flex-col gap-4">
                      <div className="p-2 bg-slate-100 rounded-lg">
                        <table className="w-full text-sm text-left rtl:text-right text-gray-500 ">
                          <thead className="text-xs text-slate-200 uppercase bg-slate-900">
                            <tr>
                              <th scope="col" className="px-6 py-3">
                                Nome
                              </th>
                              <th
                                scope="col"
                                className="hidden md:table-cell px-6 py-3"
                              >
                                CPF
                              </th>
                              <th
                                scope="col"
                                className="hidden md:table-cell px-6 py-3"
                              >
                                Código
                              </th>
                              <th scope="col" className="px-12 py-3">
                                Números
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {winners.map((winner) => (
                              <tr className="bg-slate-100 border-t ">
                                <th
                                  scope="row"
                                  className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                                >
                                  {winner.user_name}
                                </th>
                                <td className="px-6 py-4 hidden md:table-cell">
                                  {winner.user_cpf}
                                </td>
                                <td className="px-6 py-4 hidden md:table-cell">
                                  {winner.idUnico}
                                </td>
                                <td className="">
                                  {winner.numbers.map((number) => (
                                    <input
                                      value={number}
                                      disabled
                                      className="w-9 h-9 py-3 text-sm font-extrabold text-center text-gray-900 bg-white border border-gray-500 rounded-lg focus:ring-primary-500 focus:border-primary-500 "
                                    />
                                  ))}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-14 m-auto">
                    <h3 className="text-lg text-white">
                      Sem vencedores nesta rodada :(
                    </h3>
                  </div>
                )}
              </div>
              <div className="flex flex-col items-center gap-4">
                {numbersAndCount.length > 0 && (
                  <div className="flex flex-col items-center gap-4">
                    <h2 className="text-2xl font-medium text-white">
                      Mais Apostados
                    </h2>
                    <div className="p-2 bg-slate-100 rounded-lg ">
                      <table className=" w-full text-sm text-left block max-h-60 overflow-y-scroll rtl:text-right text-gray-500">
                        <thead className="text-xs text-slate-200 uppercase bg-slate-900">
                          <tr>
                            <th scope="col" className="px-2 py-2">
                              Número
                            </th>
                            <th scope="col" className="px-2 py-2">
                              Apostas
                            </th>
                          </tr>
                        </thead>
                        <tbody className="">
                          {numbersAndCount.map((nnc) => (
                            <tr className="bg-slate-100 border-t ">
                              <th
                                scope="row"
                                className="px-2 py-2 font-medium text-gray-900 whitespace-nowrap"
                              >
                                {nnc.number}
                              </th>
                              <td className="px-2 py-2 font-medium text-gray-900 whitespace-nowrap">
                                {nnc.count}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <h3 className="text-base text-white font-semibold">
                  Sorteios Realizados{": " + (numbers.length - 4)}
                </h3>
                <h3 className="text-base text-white font-semibold">
                  Apostas Vencedoras{": " + winners.length}
                </h3>
                <button
                  className="py-2 px-3 bg-yellow-600 text-white font-medium rounded-lg hover:bg-yellow-700"
                  onClick={() => setNumbersAreDrawn(false)}
                >
                  Voltar para apostas
                </button>
              </div>
            </div>
          )
        ) : (
          <div className="flex flex-col items-center gap-4 text-white">
            <div className="flex flex-col items-center gap-4">
              <h2 className="text-4xl font-medium">Apostas</h2>
              {/* <button
                className="bg-slate-200 text-slate-950 font-medium flex gap-2 items-center px-3 py-1 rounded-lg hover:bg-slate-300"
                onClick={getValidBets}
              >
                <Reload />
                <span>Recarregar</span>
              </button> */}
            </div>
            <div className="p-2 bg-slate-100 rounded-lg">
              <table className=" w-full text-sm text-left rtl:text-right text-gray-500">
                <thead className="text-xs text-slate-200 uppercase bg-slate-900">
                  <tr>
                    <th scope="col" className="px-6 py-3">
                      Nome
                    </th>
                    <th scope="col" className="px-6 py-3 hidden md:table-cell">
                      CPF
                    </th>
                    <th scope="col" className="px-6 py-3 hidden md:table-cell">
                      Código
                    </th>
                    <th scope="col" className="px-12 py-3">
                      Números
                    </th>
                  </tr>
                </thead>
                <tbody className="">
                  {validBets.map((bet) => (
                    <tr className="bg-slate-100 border-t ">
                      <th
                        scope="row"
                        className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                      >
                        {bet.user_name}
                      </th>
                      <td className="px-6 py-4 hidden md:table-cell">
                        {bet.user_cpf}
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        {bet.idUnico}
                      </td>
                      <td className="">
                        {bet.numbers.map((number) => (
                          <input
                            value={number}
                            disabled
                            className="w-9 h-9 py-3 text-sm font-extrabold text-center text-gray-900 bg-white border border-gray-500 rounded-lg focus:ring-primary-500 focus:border-primary-500 "
                          />
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
