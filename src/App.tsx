import * as Dialog from "@radix-ui/react-dialog";
import { NewBetModal } from "./NewBet";
import { api } from "./lib/axios";
import { useEffect, useState } from "react";

export interface Bet {
  idUnico: number;
  user_name: string;
  user_cpf: string;
  numbers: number[];
  surprise: boolean;
}

export const App = () => {
  const [numbersAreDrawn, setNumbersAreDrawn] = useState(false);
  const [winners, setWinners] = useState<Bet[]>([]);
  const [numbers, setNumbers] = useState<number[]>([]);
  const [validBets, setValidBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(false);

  const makeNumbersDraw = async () => {
    setLoading(true);
    try {
      setNumbersAreDrawn(true);
      const response: { data: { winners: Bet[]; sortedNumbers: number[] } } =
        await api.post("/numbers-draw");
      setValidBets([]);
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
      <div className="flex flex-col items-center p-10 space-y-4">
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
            onClick={makeNumbersDraw}
            disabled={numbersAreDrawn}
            className="disabled:opacity-50 disabled:cursor-not-allowed py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700"
          >
            Sortear números
          </button>
        </div>

        {numbersAreDrawn ? (
          loading ? (
            <div className="w-full flex justify-center">
              <h3 className="text-2xl text-white">Carregando</h3>
            </div>
          ) : (
            <div className="flex flex-col text-white">
              {numbers.length > 0 && (
                <div className="flex flex-col items-center space-y-4">
                  <h2 className="text-2xl font-medium">Números sorteados</h2>
                  <div className="grid grid-cols-5 md:grid-cols-10 gap-4">
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
                  <h2 className="text-2xl font-medium mt-4">Ganhadores</h2>
                  <div className="flex flex-col gap-4">
                    <div className="relative overflow-x-auto">
                      <table className="w-full text-sm text-left rtl:text-right text-gray-500 ">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 ">
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
                            <tr className="bg-white border-b ">
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
                <div className="w-full flex justify-center">
                  <h3 className="text-2xl text-white">
                    Sem vencedores nesta rodada
                  </h3>
                </div>
              )}
              <div className="flex w-full justify-center mt-10">
                <button
                  className="py-2 px-3 bg-yellow-500 text-white font-medium rounded-lg hover:bg-yellow-700"
                  onClick={() => setNumbersAreDrawn(false)}
                >
                  Voltar para modo apostas
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
