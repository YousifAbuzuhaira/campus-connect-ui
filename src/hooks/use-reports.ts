import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, ENDPOINTS } from '../lib/api-config';
import { Report, CreateReport } from '../lib/types';

// Report hooks
export const useCreateReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateReport): Promise<Report> => {
      const response = await api.post(ENDPOINTS.REPORTS.CREATE, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-reports'] });
    },
  });
};

export const useMyReports = () => {
  return useQuery<Report[]>({
    queryKey: ['my-reports'],
    queryFn: async () => {
      const response = await api.get(ENDPOINTS.REPORTS.MY_REPORTS);
      return response.data;
    },
  });
};

export const useReport = (reportId: string) => {
  return useQuery<Report>({
    queryKey: ['report', reportId],
    queryFn: async () => {
      const response = await api.get(ENDPOINTS.REPORTS.BY_ID(reportId));
      return response.data;
    },
    enabled: !!reportId,
  });
};